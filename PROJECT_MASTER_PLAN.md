# Master Web Development & Implementation Plan
**Scope**: FastAPI Backend (`Backend_page`) & React Web Frontend (`Frontend_page`)  
**Design System**: Shadcn UI / Radix / Tailwind CSS  
**Status**: Active — Phase 1 Execution  
**Last Updated**: 2026-08-25  

---

## 1. Executive Summary & Strategy
To build a fully functional, robust event management ecosystem, execution is strictly focused on **Web (Backend + Frontend)** first. Mobile application development (`Mobile_App`) is deferred until all web workflows are stable and tested.

The foundational anchor of the entire platform is **Organizer Event Creation**. To streamline development velocity, we are integrating:
1. **Shadcn UI Aesthetics**: Clean, modern component architecture across the entire frontend.
2. **Excel Bulk Category Import**: Upload `.xlsx`/`.csv` files for quick category setup.
3. **7-Step Event Wizard Auto-Fill & Excel Import**: Instant population of all 7 wizard steps with demo data or Excel file upload, eliminating repetitive manual form filling during dev/testing.

---

## 2. Platform Architecture Matrix (Web Stack)

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                              FASTAPI BACKEND (`Backend_page`)                     │
│  - Modular Architecture (`app/modules/`)                                          │
│  - PostgreSQL / MySQL Database (`app/models/` + SQLAlchemy)                       │
│  - Excel Data Parser & Bulk Ingestion Services                                    │
│  - JWT & OAuth2 Authentication & RBAC Middleware                                  │
└──────────────┬────────────────────────┬────────────────────────┬──────────────────┘
               │                        │                        │
  ┌────────────▼────────────┐ ┌─────────▼────────────┐ ┌─────────▼────────────┐
  │   ORGANIZER MODULE      │ │   ATTENDEE MODULE    │ │   EXHIBITOR MODULE   │
  │ - 3-Step KYC Onboarding │ │ - Event Discovery    │ │ - Stall Floor Plans  │
  │ - 7-Step Event Wizard   │ │ - Ticket Checkout    │ │ - Vendor Onboarding  │
  │ - Excel Event Auto-Fill │ │ - Digital QR Passes  │ │ - Spot Registration  │
  │ - Gate & Analytics      │ │ - Booking History    │ │ - Staff QR Passes    │
  └─────────────────────────┘ └──────────────────────┘ └──────────────────────┘
                                        │
                             ┌──────────▼───────────┐
                             │   SUPER ADMIN PANEL  │
                             │ - Excel Category Up  │
                             │ - Event Approvals    │
                             │ - Payout Releases    │
                             └──────────────────────┘
```

---

## 3. Phase Breakdown & Detailed Progress

### Phase 1: Organizer Event Creation & Management (IN PROGRESS 🛠️)
- [x] Updated project rules (`.agents/AGENTS.md`) and Master Plan (`PROJECT_MASTER_PLAN.md`).
- [ ] **Shadcn UI Setup & Utilities**:
  - Install `xlsx` dependency in `Frontend_page` for client-side Excel parsing.
  - Create reusable Shadcn UI styled primitives (Card, Button, Dialog, Badge, Input, Select, Tabs, Progress, Alert).
- [ ] **Excel Import & Quick Auto-Fill Engine**:
  - Create `excelService.js` in frontend for parsing Category templates and 7-Step Event creation Excel templates.
  - Add **"Auto-Fill Demo Event"** & **"Upload Excel (.xlsx)"** action bar in `CreateEvent.jsx`.
- [ ] **Backend FastAPI Event & Category API**:
  - `POST /api/v1/events/excel-upload` & `POST /api/v1/events/` endpoints.
  - Category endpoints (`/api/v1/categories`, `/api/v1/categories/excel-upload`).
- [ ] **Frontend 7-Step Event Creation Integration**:
  - Step 1 Details (Category, Subcategory, Venue, Custom Category modal).
  - Step 2 Booking & Schedule.
  - Step 3 Layout & Stalls.
  - Step 4 Documents & Media.
  - Step 5 Terms & Policies.
  - Step 6 Vendors & Sponsors.
  - Step 7 Summary & Publish.

---

### Phase 2: Category & Subcategory Master Control (Super Admin + Excel)
- [ ] **Backend**: Category & Subcategory bulk upload processing (`/api/v1/categories/bulk`).
- [ ] **Frontend**: Super Admin Category Management dashboard with Excel file drag-and-drop upload zone and downloadable sample format.

---

### Phase 3: Attendee Discovery & Ticket Booking Flow
- [ ] **Backend**: Booking & Payment FastAPI endpoints (`/api/v1/bookings`, Razorpay payment integration, QR Pass generation).
- [ ] **Frontend**: Attendee `Home.jsx` dynamic filtering by Category/Subcategory pills, `EventDetail.jsx` tier selection, checkout modal, `UserBooking.jsx` digital QR ticket pass display.

---

### Phase 4: Exhibitor Portal & Interactive Stall Booking
- [ ] **Backend**: Stall reservation & Exhibitor Lead APIs (`/api/v1/stalls/reserve`, `/api/v1/exhibitors`).
- [ ] **Frontend**: Exhibitor Portal entry card, `Exhibitor_Home`, interactive floor plan booth selector (`BookStall.jsx`), staff pass manager, spot lead registration.

---

### Phase 5: Super Admin Governance, Event Moderation & Payouts
- [ ] **Backend**: Admin approval routes (`/api/v1/admin/events/{id}/approve`, `/api/v1/admin/organizers/{id}/payout`).
- [ ] **Frontend**: `Super_user_Home`, event verification & approval queue (`AdminApproval.jsx`), direct payout release dashboard (`Billing.jsx`).

---

### Phase 6: Gate Scanners, Analytics & Live Dashboard
- [ ] **Backend**: Ticket QR Scanner validation endpoints (`/api/v1/checkin/scan`), Food perk scanner (`/api/v1/checkin/food`), real-time metrics stream.
- [ ] **Frontend**: Live revenue dashboard (`LiveDashboard.jsx`), live gate entry scanner modal, food perk validation interface.

---

## 4. Immediate Execution Work items
1. Run `npm install xlsx` in `Frontend_page`.
2. Implement Shadcn UI design components and Excel helper service in `Frontend_page/src/Services/excelService.js`.
3. Enhance `CreateEvent.jsx` with Excel upload dropzone and one-click "Auto-Fill Demo Event Data" button.
4. Upgrade FastAPI backend event routes in `Backend_page/app/modules/events` to handle full 7-step wizard saving and Excel bulk payload ingestion.
