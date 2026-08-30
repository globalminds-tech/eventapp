# 🏗️ Master Product Execution Plan & Module 1 Deep-Dive

> **Platform**: BookMyEvent (FastAPI Backend + React Frontend)  
> **Date**: August 30, 2026  
> **Primary Goal**: Transition from hardcoded prototypes to a high-concurrency, enterprise-grade 4-sided platform (Super Admin, Organizer, Exhibitor, Attendee).

---

## 🗺️ Part 1: Overarching Master Execution Roadmap

We will build and polish the product in **5 Sequential Phased Modules**:

```
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ MODULE 1: Dynamic Data, Venue Space Math & Wizard Conflict Audit (CURRENT ANCHOR)      │
 │ - Feet space calculation & HARD restriction against overall venue space limit.          │
 │ - Size-Quantity Stall Breakdown (e.g. 10x10ft x 5 stalls, 10x20ft x 10 stalls).        │
 │ - Organizer Custom Category Request -> Admin Auto-Fill & Approval Page.                │
 │ - Dynamic Category Taxonomy with Admin Category Images & Optional Venue Images.        │
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
 ┌───────────────────────────────────────────▼────────────────────────────────────────────┐
 │ MODULE 2: Exhibitor Request, Approval, Email Notification & Payment Engine             │
 │ - Exhibitor submits stall request with company profile & visiting card.                │
 │ - Organizer reviews in dashboard -> Approves or Rejects with custom reason.            │
 │ - Automated Email Notification (Approved/Rejected) + 24-Hour Payment Expiry Lock.      │
 │ - High-concurrency row locking to prevent double-booking under heavy traffic.          │
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
 ┌───────────────────────────────────────────▼────────────────────────────────────────────┐
 │ MODULE 3: Super Admin Control & Global Governance                                      │
 │ - Category & Subcategory CRUD + Category Request Review + Excel Bulk Import (.xlsx).    │
 │ - Event Verification, Organizer KYC verification, and Razorpay Payout Engine.          │
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
 ┌───────────────────────────────────────────▼────────────────────────────────────────────┐
 │ MODULE 4: Attendee Ticket Discovery & QR Gate Scanner                                  │
 │ - Filterable All-Events Feed with Category Images, Razorpay Ticket Checkout, QR Passes.│
 │ - Sub-second Gate Entry & Food Perk Check-in scanners.                                 │
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
 ┌───────────────────────────────────────────▼────────────────────────────────────────────┐
 │ MODULE 5: Platform Load Testing, Concurrency Safeguards & Edge-Case Hardening          │
 │ - Database row-level locks, Redis caching, stress testing high-traffic bursts.         │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 Part 2: Granular Deep-Dive Plan for MODULE 1 & User Requirements

### 1. Size-Wise Stall Quantity Breakdown Matrix
- **Workflow**:
  - In `Step3Layout.jsx` / Step 5 Layout, when organizers configure stalls, they define:
    - **Stall Dimension**: e.g., `10ft x 10ft` (100 sq.ft) OR `10ft x 20ft` (200 sq.ft).
    - **Stall Quantity**: e.g., `5 stalls` of 10x10ft, `10 stalls` of 10x20ft.
  - **Live Breakdown UI Table**:
    - `10ft x 10ft` | 100 sq.ft | **5 Stalls** | Subtotal: 500 sq.ft
    - `10ft x 20ft` | 200 sq.ft | **10 Stalls** | Subtotal: 2,000 sq.ft
    - **Total Allocated**: **15 Stalls** | **2,500 sq.ft** / **35,000 sq.ft Overall Limit**
  - **Hard Space Restriction**: Form save is blocked if $\sum (\text{Stall Count} \times \text{Stall Area}) > \text{Overall Venue Space}$.

---

### 2. Organizer Custom Category Request & Admin Auto-Fill Workflow
- **Organizer Request Flow**:
  - In `Step1EventDetails.jsx`, next to Category dropdown, add `+ Request New Category`.
  - Opens a modal where organizer submits: `Suggested Main Category Name`, `Suggested Subcategory Name`, `Reason / Description`.
  - Saves to database model `CategoryRequest` (`status: pending`).
- **Super Admin Approval & Auto-Fill Page**:
  - In `Super_user_Home.jsx`, Super Admin sees a badge: `🔔 1 Category Request Pending`.
  - Admin clicks the notification to open **Category Requests & Suggestions**.
  - Clicking **"Add Category"** on a request opens the Category Creation Form with the organizer's suggested **Main Category** & **Subcategory** names **automatically pre-filled**!
  - Admin attaches a Category Banner Image URL and clicks **Confirm & Add**.
  - System adds the Category to the official master list and updates request status to `APPROVED`.

---

### 3. Additional Features Re-Cap
- **Overall Feet Space Calculation**: Square Feet (sq.ft) as standard unit with hard ceiling restriction.
- **Exhibitor Request-Approval-Email Engine**: Exhibitor profile submit -> Organizer approve/reject -> Auto Email with 24h payment link.
- **Dynamic Category Images**: Category banner images for dynamic Attendee discovery cards.
- **Optional Venue Image Upload**: Override venue photo per event instance.
- **Wizard Duplication Audit**: Unified `is_paid` flag and synchronized pricing schema.

---

## 🛠️ Data Model & Code Changes

#### [NEW] [category_request.py](file:///d:/personal/eventapp/Backend_page/app/models/category_request.py)
- Model `CategoryRequest`: `id`, `organizer_id`, `category_name`, `subcategory_name`, `reason`, `status` (`pending`/`approved`/`rejected`), `created_at`.

#### [MODIFY] [category.py](file:///d:/personal/eventapp/Backend_page/app/models/category.py)
- Add `category_image` mapped column to `Category`.

#### [MODIFY] [Step1EventDetails.jsx](file:///d:/personal/eventapp/Frontend_page/src/Organizer/MyEvent/CreateEvent/steps/Step1EventDetails.jsx)
- Add `+ Request New Category` trigger modal for organizers.
- Add optional **Venue Image Upload** input.

#### [MODIFY] [Step3Layout.jsx](file:///d:/personal/eventapp/Frontend_page/src/Organizer/MyEvent/CreateEvent/steps/Step3Layout.jsx)
- Add Stall Size + Count breakdown matrix (e.g. `10x10ft x 5 stalls`).
- Live space meter against Overall Venue Space (sq.ft) with hard block on overflow.

#### [MODIFY] [Super_user_Home.jsx](file:///d:/personal/eventapp/Frontend_page/src/Super_User/Super_user_Home.jsx)
- Add **Category Requests Tab** with **Auto-Fill & Add** action trigger.
