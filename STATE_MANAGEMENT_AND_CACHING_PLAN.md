# Master Architectural Plan: State Management & Caching System
**Project**: BookMyEvent Web Platform (FastAPI Backend + React Web Frontend)  
**Target Environments**: Production (Render Backend + Vercel Frontend + Supabase DB) & Local Development  

---

## 1. Executive Summary & Goals

The objective of this architecture is to transform the application into an enterprise-grade, high-performance platform with:
1. **Zero-Latency Route Transitions**: Instant page switches (0ms perceived latency) using Redux Toolkit in-memory caching.
2. **Database Offloading**: 80%+ reduction in direct Supabase PostgreSQL queries using Upstash/Redis distributed caching.
3. **No Redundant API Calls**: Visiting the same tab (e.g. Organizer Dashboard, Category Master, Exhibitor Leads) will not trigger repeated network requests if data is fresh.
4. **Instant Stale Invalidation**: Automatic, deterministic cache busting when events are created, edited, approved, or deleted.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Redux)                        │
│                                                                        │
│   [ UI Component / Page ]                                              │
│             │                                                          │
│             ▼                                                          │
│   [ Redux Toolkit Store ] ──(Cache Hit: 0ms)──► Instant Render         │
│             │ (Cache Miss / Invalidation)                              │
│             ▼                                                          │
│   [ Axios Client (with 45s Timeout & Same-Origin Proxy) ]              │
└─────────────┬──────────────────────────────────────────────────────────┘
              │ HTTP GET / POST
              ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (FastAPI + Redis)                       │
│                                                                        │
│   [ Router / Controller ]                                              │
│             │                                                          │
│             ▼                                                          │
│   [ Redis / Upstash Cache ] ──(Hit: 15-30ms)──► Return Cached JSON    │
│             │ (Miss / Stale TTL)                                       │
│             ▼                                                          │
│   [ SQLAlchemy SessionLocal ]                                          │
│             │                                                          │
│             ▼                                                          │
│   [ Supabase PostgreSQL ] ────────────────────► Save to Redis & Return │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Complete Module Inventory Across All 5 Sides

The application covers five operational tiers. State and caching are applied according to the sensitivity and frequency of each tier's data:

### Tier 1: Public & Discovery
* **Pages**: `HomePage.jsx` (`/`), `AllEventsPage.jsx` (`/all-events`), `EventDetailPage.jsx` (`/event/:id`), `QRValidationPage.jsx` (`/validate-booking/:id`).
* **Caching Needs**: **Aggressive Redis Caching (5–15 mins)**. High read-to-write ratio. Must be ultra-fast for SEO and anonymous visitors.

### Tier 2: Authenticated Attendee Portal
* **Pages**: `UserBookingPage.jsx` (`/usersbooking/:id`), `ProfilePage.jsx` (`/profile`), `MyPassesPage.jsx` (`/my-passes`, `/my-bookings`), `UpgradeOrganizerPage.jsx`, `UpgradeExhibitorPage.jsx`.
* **Caching Needs**: **Redux User Slice + Redis (1 min)**. User tickets and active QR passes stored in Redux; pass check-in status syncs on demand.

### Tier 3: Event Organizer Console (`/OrganizerHome`)
* **Pages**: `OrganizerDashboardPage.jsx`, `EventsPage.jsx` (Wizard / Edit), `EventCheckInPage.jsx`, `FoodCheckInPage.jsx`, `AddonCheckInPage.jsx`, `ManageStallPage.jsx`, `TeamManagementPage.jsx`, `ReceiptPage.jsx`, `BillingPage.jsx`, `MasterDataPage.jsx`, `EventReportsPage.jsx`, `LiveDashboardPage.jsx`, `LiveFoodDashboardPage.jsx`, `MessagesPage.jsx`, `CouponPage.jsx`.
* **Caching Needs**: **Redux In-Memory (Cache-First) + Redis (3 mins)**. Master Data (venues, vendors, policies) cached for 15 mins. Real-time telemetry (gate check-ins) uses polling or fresh queries.

### Tier 4: Exhibitor Portal (`/exhibitor`)
* **Pages**: `ExhibitorHomePage.jsx`, `MyBookingPage.jsx`, `ExhibitorBookingDetailPage.jsx`, `UpcomingEventsPage.jsx`, `ExhibitorLeadsPage.jsx`, `ExhibitorBillingPage.jsx`, `StallBookingPage.jsx`.
* **Caching Needs**: **New `exhibitorSlice` in Redux + Redis (3 mins)**. Reserved stalls and upcoming event stall inventory cached with instant invalidation on booking checkout.

### Tier 5: Super User / Platform Admin (`/superuser`)
* **Pages**: `SuperUserDashboardPage.jsx`, `EventApprovalQueuePage.jsx`, `EventInspectionDetailPage.jsx`, `CategoryMasterPage.jsx`, `KycVerificationPage.jsx`, `AdminPayoutsPage.jsx`.
* **Caching Needs**: **`adminSlice` in Redux + Redis (2–5 mins)**. Dashboard KPI metrics, Category & Subcategory tree cached with instant cache clearing on Admin mutation.

---

## 3. Backend Redis Caching Architecture

### A. Infrastructure Provider
* **Provider**: **Upstash Redis** (Free serverless Redis, 10,000 commands/day, persistent, supports standard `rediss://...` connection URL).
* **Render Environment Variable**: `REDIS_URL=rediss://default:xxxxxx@xxxx.upstash.io:6379`.
* **Fallback Guarantee**: If Redis is offline or `REDIS_URL` is unset, `app/extensions/redis.py` catches exceptions gracefully and queries the PostgreSQL database without crashing.

### B. Redis Cache Keys & TTL Matrix

| Data Scope | Redis Cache Key Pattern | TTL (Seconds) | Invalidation Trigger |
| :--- | :--- | :--- | :--- |
| **Public Events Catalog** | `events:approved:all` | 300 (5m) | Event created, edited, approved, deleted |
| **Single Event Details** | `events:detail:<event_id>` | 600 (10m) | Event updated or cancelled |
| **Category Tree** | `catalog:categories:all` | 3600 (1h) | Category created, updated, deleted, or bulk imported |
| **Super Admin Stats** | `admin:dashboard_stats:<period>` | 180 (3m) | New booking, payout approved, or manual refresh |
| **Organizer Dashboard** | `organizer:dashboard:<org_id>` | 180 (3m) | Ticket booked, stall approved, event updated |
| **Master Venues & Vendors**| `master:venues:<org_id>`, `master:vendors:<org_id>` | 900 (15m) | Venue / vendor added or deleted |
| **Exhibitor Stall Grid** | `stalls:event:<event_id>` | 120 (2m) | Stall reserved or status changed |

### C. Backend Invalidation Helper Pattern
```python
from app.extensions.redis import redis_cache

class CacheInvalidator:
    @staticmethod
    def invalidate_events(event_id: str = None):
        redis_cache.clear_pattern("events:*")
        redis_cache.clear_pattern("admin:dashboard_stats:*")
        if event_id:
            redis_cache.delete(f"events:detail:{event_id}")
            redis_cache.delete(f"stalls:event:{event_id}")

    @staticmethod
    def invalidate_categories():
        redis_cache.clear_pattern("catalog:categories:*")

    @staticmethod
    def invalidate_organizer(org_id: str):
        redis_cache.clear_pattern(f"organizer:*:{org_id}")
        redis_cache.clear_pattern(f"master:*:{org_id}")
```

---

## 4. Frontend Redux Toolkit State Management

### A. Store Topology
The Redux store is organized into 5 focused slices:

```
src/app/store/
├── store.js            # configureStore + axiosClient store injection
├── authSlice.js        # User session, JWT tokens, active_role, permissions
├── userSlice.js        # Attendee profile, KYC action items, user passes
├── eventSlice.js       # Event wizard draft, cached public events, active filters
├── adminSlice.js       # KPI stats, approval queue, KYC list, categories
└── exhibitorSlice.js   # (New) Stall bookings, leads, upcoming exhibition events
```

### B. "Cache-First" Thunk Pattern (Eliminates Duplicate Requests)
Every thunk checks if data has already been loaded in the Redux state. If present and not forced, it returns immediately without firing an HTTP request:

```javascript
export const fetchCategoriesThunk = createAsyncThunk(
  "admin/fetchCategories",
  async (force = false, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      // Cache hit in Redux: 0ms navigation, zero network bandwidth
      if (!force && state.admin?.categoriesLoaded && state.admin?.categories?.length > 0) {
        return state.admin.categories;
      }
      const res = await axiosClient.get("/superadmin/api/categories");
      return res.data?.data || res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to load categories");
    }
  }
);
```

### C. Optimistic UI Updates
For actions like approving an event in Super Admin or redeeming a food pass in Organizer Check-in:
1. Redux updates the UI **instantly** (status changes to `APPROVED` or `REDEEMED`).
2. The API request fires in the background.
3. If the network request fails, Redux automatically rolls back to the previous state and shows an error toast.

---

## 5. Phased Implementation Roadmap

### Phase 1: Core Redis Integration (Backend)
- [ ] Connect Upstash Redis instance via `REDIS_URL` in Render environment variables.
- [ ] Implement caching on `/superadmin/home/get-events`, `/superadmin/api/categories`, and `/superadmin/api/dashboard-stats`.
- [ ] Add `CacheInvalidator` hooks to event creation, update, and category import endpoints.

### Phase 2: Redux Store Consolidation (Frontend)
- [ ] Standardize `adminSlice.js` with `statsLoaded`, `categoriesLoaded`, and `approvalLoaded` flags.
- [ ] Create `exhibitorSlice.js` to manage stall reservations and booth leads.
- [ ] Connect `HomePage.jsx` and `AllEventsPage.jsx` to `eventSlice` to prevent reloading events on back-navigation.

### Phase 3: Granular Cache Invalidation & Sync
- [ ] Wire automatic Redux invalidation triggers when an organizer updates an event.
- [ ] Add a visual "Pull to Refresh" / "⚡ Sync Data" button in tables for manual override.
- [ ] Ensure `first_login` and password reset state updates both Redux and local storage cleanly.

### Phase 4: Production Verification & Benchmarks
- [ ] Measure TTFB (Time to First Byte) on `/superadmin/home/get-events` (Target: < 50ms from Redis).
- [ ] Validate 0 redundant network calls when switching between sidebar tabs.
- [ ] Confirm no memory leaks or stale state on user role switching or logout.
