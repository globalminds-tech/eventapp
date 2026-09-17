# Exhibitor Portal State Management Architecture & Extension Guide

## 1. Executive Summary & Objective

In high-performance multi-portal web applications (Exhibitor, Organizer, Super Admin), recurring loading spinners and redundant API roundtrips degrade the user experience. 

To resolve this across the **Exhibitor Portal** and provide a reusable blueprint for the **Organizer** and **Super Admin** portals, we implemented a **Centralized Redux Toolkit with SWR (Stale-While-Revalidate) Caching Architecture**.

### Key Benefits Achieved:
1. **Instant Page Transitions**: Navigating between *Dashboard*, *My Bookings*, *Upcoming Events*, *Visitor Leads*, *Billing & Invoices*, and *Team Management* renders instantly from memory cache.
2. **Zero Flickers / Skeleton Polish**: When data is initially loading or revalidating, synchronized animated Skeleton components (`StatCardSkeleton`) replace jarring spinner overlays.
3. **Guaranteed Freshness on Mutations**: When a user performs an action (e.g., adds a lead, books a stall, makes a payment), the corresponding slice cache is immediately marked dirty or updated optimistically.
4. **Resilient to Network Hiccups**: If an API call fails or lags, previously cached state is preserved for viewing instead of showing blank screens.

---

## 2. Architecture & File Structure

```text
Frontend_page/src/
├── app/
│   └── store/
│       ├── store.js                   # Redux root store registering reducers
│       ├── exhibitorSlice.js          # Exhibitor domain slice (SWR cache + thunks)
│       ├── authSlice.js               # User authentication & active role state
│       └── eventSlice.js              # General public catalog slice
├── components/
│   └── ui/
│       └── StatCardSkeleton.jsx       # Unified KPI stat card skeleton loader
└── features/
    └── exhibitor/
        ├── pages/
        │   ├── ExhibitorHomePage.jsx  # Reads cached bookings & events; displays 8 KPI stats
        │   ├── MyBookingPage.jsx      # Live API filtering, status tabs, cached bookings
        │   ├── UpcomingEventsPage.jsx # Memoized events catalog with booking status check
        │   ├── ExhibitorLeadsPage.jsx # Spot Lead capture modal + cached event leads
        │   ├── ExhibitorBillingPage.jsx # Real GST Tax Invoices + modal printable bill
        │   └── ExhibitorTeamPage.jsx  # Booth staff roles & digital QR passes
        └── api/
            └── exhibitor.api.js       # Low-level Axios endpoints
```

---

## 3. Redux Exhibitor Slice Schema (`exhibitorSlice.js`)

The state tree is organized into granular sub-domains with independent timestamps (`lastFetched`) and loading indicators:

```javascript
const initialState = {
  // 1. My Bookings
  bookings: {
    list: [],
    loading: false,
    error: null,
    lastFetched: null,       // Epoch timestamp in ms
    statusFilter: "all",     // Current active tab filter
    search: ""               // Current active search query
  },

  // 2. Upcoming Expos Catalog
  upcomingEvents: {
    list: [],
    loading: false,
    error: null,
    lastFetched: null
  },

  // 3. Visitor Leads (Indexed by Event UUID for multi-event isolation)
  leadsByEvent: {
    // [eventId]: { items: [...], loading: false, error: null, lastFetched: null, search: "" }
  },

  // 4. Invoices & Billing
  invoices: {
    list: [],
    loading: false,
    error: null,
    lastFetched: null,
    search: ""
  }
};
```

---

## 4. The SWR (Stale-While-Revalidate) Pattern

### Cache TTL (Time-to-Live)
A default window of **2 minutes (`2 * 60 * 1000` ms)** is configured.
- Within 2 minutes: Redux skips the network request and serves cached data instantly with `{ fromCache: true }`.
- After 2 minutes or on filter change: Redux issues an API request in the background.
- Force refresh: User clicking the `Refresh Data` button or submitting a form passes `{ force: true }`, bypassing TTL check.

### Implementation in Async Thunk:
```javascript
export const fetchExhibitorBookings = createAsyncThunk(
  "exhibitor/fetchBookings",
  async ({ userId, status = "all", search = "", force = false }, { getState, rejectWithValue }) => {
    try {
      const state = getState().exhibitor.bookings;
      const now = Date.now();
      const isFilterSame = state.statusFilter === status && state.search === search;

      // SWR Cache Hit: Return cached list immediately if within TTL and filter didn't change
      if (!force && isFilterSame && state.lastFetched && (now - state.lastFetched < CACHE_TTL_MS)) {
        return { data: state.list, fromCache: true, status, search };
      }

      // SWR Cache Miss / Stale: Fetch fresh data from backend
      const res = await getMyBookings(userId, { status, search });
      const rawList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      return { data: rawList, fromCache: false, status, search };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch bookings");
    }
  }
);
```

---

## 5. Edge Cases & Invalidation Triggers

| Scenario / Edge Case | Invalidation Action | Result |
| :--- | :--- | :--- |
| **New Lead Added via Dialog** | `createExhibitorLead.fulfilled` appends the lead optimistically and marks `leadsByEvent[eventId].lastFetched = Date.now()` | Immediate visibility in table and KPI lead counter updates without full reload. |
| **New Stall Booked** | `dispatch(invalidateBookings())` | The next time the user opens My Bookings, it fetches fresh records. |
| **User switches filter tabs (e.g. Approved -> Confirmed)** | Thunk compares `state.statusFilter !== status` | Bypasses TTL and immediately sends API query with `{ status: "confirmed" }`. |
| **User types in search input** | Debounced search trigger (300ms) with `search` param | If `state.search !== newSearch`, dispatches API query and caches results for that search query. |
| **Switching Roles (Organizer <-> Exhibitor)** | `dispatch(invalidateAll())` | Wipes stale exhibitor data so another user's or role's data never leaks. |
| **User clicks Refresh button** | Passes `{ force: true }` | Overrides TTL, spins reload icon, and refreshes Redux store. |

---

## 6. How to Replicate for the Organizer Portal (`organizerSlice.js`)

To apply this exact pattern to the **Organizer Portal**, follow these steps:

### Step 1: Create `Frontend_page/src/app/store/organizerSlice.js`
```javascript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/shared/api/axiosClient";

const CACHE_TTL_MS = 2 * 60 * 1000;

// Thunk: Organizer Events
export const fetchOrganizerEvents = createAsyncThunk(
  "organizer/fetchEvents",
  async ({ organizerId, force = false }, { getState, rejectWithValue }) => {
    try {
      const state = getState().organizer.events;
      const now = Date.now();
      if (!force && state.lastFetched && (now - state.lastFetched < CACHE_TTL_MS)) {
        return { data: state.list, fromCache: true };
      }
      const res = await apiClient.get(`/api/v1/organizer/events?organizer_id=${organizerId}`);
      return { data: res.data?.data || res.data || [], fromCache: false };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk: Organizer Attendees & Ticket Sales
export const fetchOrganizerAttendees = createAsyncThunk(
  "organizer/fetchAttendees",
  async ({ eventId, force = false }, { getState, rejectWithValue }) => {
    try {
      const cache = getState().organizer.attendeesByEvent[eventId];
      const now = Date.now();
      if (!force && cache?.lastFetched && (now - cache.lastFetched < CACHE_TTL_MS)) {
        return { eventId, data: cache.list, fromCache: true };
      }
      const res = await apiClient.get(`/api/v1/organizer/events/${eventId}/attendees`);
      return { eventId, data: res.data?.data || [], fromCache: false };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const organizerSlice = createSlice({
  name: "organizer",
  initialState: {
    events: { list: [], loading: false, error: null, lastFetched: null },
    attendeesByEvent: {},
    payouts: { list: [], loading: false, error: null, lastFetched: null }
  },
  reducers: {
    invalidateOrganizerEvents: (state) => {
      state.events.lastFetched = null;
    },
    invalidateOrganizerAttendees: (state, action) => {
      if (action.payload?.eventId && state.attendeesByEvent[action.payload.eventId]) {
        state.attendeesByEvent[action.payload.eventId].lastFetched = null;
      } else {
        state.attendeesByEvent = {};
      }
    },
    invalidateAllOrganizer: (state) => {
      state.events.lastFetched = null;
      state.attendeesByEvent = {};
      state.payouts.lastFetched = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Events
      .addCase(fetchOrganizerEvents.pending, (state) => {
        state.events.loading = true;
      })
      .addCase(fetchOrganizerEvents.fulfilled, (state, action) => {
        state.events.loading = false;
        if (!action.payload.fromCache) {
          state.events.list = action.payload.data;
          state.events.lastFetched = Date.now();
        }
      })
      .addCase(fetchOrganizerEvents.rejected, (state, action) => {
        state.events.loading = false;
        state.events.error = action.payload;
      });
  }
});

export const {
  invalidateOrganizerEvents,
  invalidateOrganizerAttendees,
  invalidateAllOrganizer
} = organizerSlice.actions;

export default organizerSlice.reducer;
```

### Step 2: Register in `store.js`
```javascript
import organizerReducer from "./organizerSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    exhibitor: exhibitorReducer,
    organizer: organizerReducer, // <-- Add here
    // ...
  }
});
```

### Step 3: Consume in Organizer Pages (e.g. `Organizerdashboard.jsx`)
```javascript
import { useSelector, useDispatch } from "react-redux";
import { fetchOrganizerEvents } from "@/app/store/organizerSlice";
import { StatCardSkeleton } from "@/components/ui/StatCardSkeleton";

export const OrganizerDashboard = () => {
  const dispatch = useDispatch();
  const { events } = useSelector((state) => state.organizer);
  const authUserId = useSelector((state) => state.auth?.user?.id);

  useEffect(() => {
    if (authUserId) {
      dispatch(fetchOrganizerEvents({ organizerId: authUserId }));
    }
  }, [authUserId, dispatch]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {events.loading && events.list.length === 0 ? (
          <StatCardSkeleton count={4} />
        ) : (
          events.list.map(event => <EventCard key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
};
```

---

## 7. How to Replicate for Admin / SuperUser Portal (`adminSlice.js`)

For the Admin / SuperUser Portal:
1. **Approval Queue Caching**: Cache pending events waiting for admin approval (`/api/v1/superuser/approvals`).
2. **KYC Verification Caching**: Cache pending user KYC applications (`/api/v1/superuser/kyc-verifications`).
3. **Admin Invalidation Hook**: When Super Admin clicks `Approve Event` or `Reject Event`, immediately dispatch `invalidateAdminApprovals()`, which refreshes the queue without requiring a hard browser refresh.

---

## 8. Summary Checklist for Any Portal

- [x] Create domain slice with `lastFetched`, `loading`, `error`, and sub-resources.
- [x] Configure SWR cache check (`now - lastFetched < CACHE_TTL_MS`) in async thunk.
- [x] Pass `{ force: true }` when the user clicks the refresh button or upon mutations.
- [x] Replace all spinner icons (`Loader2`) on KPI stat cards with `StatCardSkeleton`.
- [x] When rendering stat metrics while revalidating, show an animated skeleton placeholder (`h-8 w-20 bg-slate-200 animate-pulse rounded-md`) so numbers never jump or flash.
