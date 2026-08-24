# Super Admin Master Task Tracker & Pending Roadmap

> **Platform**: BookMyEvent (React Native Mobile App & Python Flask Backend)  
> **Module**: Super Admin (Platform Governance, Category Master, Approvals, Payouts, Vendor Audit)

---

## Executive Super Admin Task Matrix

```
  [1. CATEGORY MASTER]         ▶ Status: 90% (Backend Models & UI complete, adding Subcategory Edit)
  [2. EVENT APPROVALS QUEUE]  ▶ Status: 85% (Review Card UI & Status Update API connected)
  [3. ORGANIZER KYC QUEUE]     ▶ Status: 75% (3-Step KYC Review & Verification API pending)
  [4. PAYOUTS & COMMISSIONS]  ▶ Status: 60% (Commission Settlement & Payout Release API pending)
  [5. EXHIBITOR STALL AUDIT]   ▶ Status: 60% (Stall Inventory & Booth Lead Audit view pending)
```

---

## Detailed Task Checklist

### Task 1: Category & Subcategory Master
- [x] Create `CategoryMaster` SQLAlchemy Model in Flask (`app/models/category.py`).
- [x] Implement Flask API endpoints: `GET /api/admin/categories` and `POST /api/admin/categories`.
- [x] Connect Mobile App API caller `getAdminCategories()` & `createAdminCategory()` in `Services/api.js`.
- [x] Add Main Category creation modal with comma-separated subcategories in `Super_user_Home.js`.
- [x] Add Subcategory edit & delete action triggers per category card.

### Task 2: Event Approvals Queue
- [x] Implement `GET /api/admin/events` and `PUT /api/admin/events/<id>/status` in Flask backend.
- [x] Build Shadcn UI Event Review Cards with status badges (`PENDING`, `APPROVED`, `REJECTED`).
- [x] Add Event Preview Modal (banner image, ticket tiers breakdown, schedule, venue location map).

### Task 3: Organizer KYC & Account Verification Queue
- [x] Create Flask API endpoint `GET /api/admin/organizers/kyc-pending` & `PUT /api/admin/organizers/<id>/kyc-status`.
- [x] Add **Organizer KYC Verification** tab in `Super_user_Home.js`.
- [x] Display Representative Contact, Company Legal (GST/PAN), and Payout Bank Details with Approve/Reject buttons.

### Task 4: Platform Payout Settlements & Commission Management
- [x] Create Flask API endpoints: `GET /api/admin/payouts/pending` & `POST /api/admin/payouts/release`.
- [x] Add **Payouts & Billing** tab in `Super_user_Home.js`.
- [x] Render Gross Revenue, Platform Commission %, Net Organizer Payout, and Bank Payout Release trigger button.

### Task 5: Exhibitor Booth & Exhibition Event Audit
- [ ] Create Flask API endpoint `GET /api/admin/exhibitors/overview`.
- [ ] Display active exhibition events, total stalls booked, revenue per expo, and top booth leads.

---

## Backend API Specification (Monolith Style)

| Endpoint | Method | Purpose |
| :--- | :---: | :--- |
| `/api/admin/categories` | `GET` | Retrieve all active Main Categories & nested Subcategories |
| `/api/admin/categories` | `POST` | Create or update a Main Category with nested Subcategories |
| `/api/admin/categories/<id>` | `DELETE` | Disable or archive a Category |
| `/api/admin/events/pending` | `GET` | Fetch pending DIY events awaiting admin review |
| `/api/admin/events/<id>/status` | `PUT` | Approve, Reject, or Request Changes for an event |
| `/api/admin/organizers/kyc-pending` | `GET` | Fetch organizer KYC submissions |
| `/api/admin/organizers/<id>/kyc-status` | `PUT` | Approve or Reject organizer KYC submission |
| `/api/admin/payouts/pending` | `GET` | Fetch pending organizer revenue payout batches |
| `/api/admin/payouts/release` | `POST` | Execute direct bank payout release to organizer |
