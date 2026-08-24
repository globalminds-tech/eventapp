# Master Task Tracker: Step 1 — Super Admin & Shadcn UI

> **Current Phase**: Step 1: Super Admin (Governance, Category & Subcategory Master, Event Approval, KYC Verification)  
> **Rule**: Every completed item is marked with `[x]` upon empirical runtime verification.

---

## Task Checklist Matrix

### 🟢 1. Shadcn-inspired React Native Primitive UI Components (`src/components/ui/`)
- [x] `Button.js` — Primary, Accent, Outline, Ghost, Danger button variants with loading indicators.
- [x] `Card.js` — Elevate, Bordered, Header, Content, Footer card components.
- [x] `Badge.js` — Status pills (Success, Warning, Danger, Info, VIP).
- [x] `Input.js` — TextInput, SearchInput, PasswordInput with icon support.
- [x] `Modal.js` — Smooth slide/fade dialog container.
- [x] `Tabs.js` — Segmented pill tabs & tab navigation strip.
- [x] `StatCard.js` — Metric counter cards with trend indicators.
- [x] `Toast.js` — Animated notification toast banners.

---

### 🟢 2. Super Admin Frontend UI (`Super_user_Home.js`)
- [x] Refactor `Super_user_Home.js` using the Shadcn Primitive UI library (`Card`, `Button`, `Badge`, `Tabs`, `StatCard`).
- [x] Add **Category & Subcategory Master** tab (Add/Edit Main Categories & nested Subcategories).
- [x] Add **Event Approvals Queue** tab (Review event media, details, schedule, approve or reject).
- [x] Add **Organizer KYC Verification Queue** tab (Verify company GST/PAN & payout bank accounts).

---

### 🟢 3. Flask Backend API Integration (`Backend_page`)
- [x] **Category Master API**:
  - `GET /api/admin/categories` (Fetch all main categories & subcategories).
  - `POST /api/admin/categories` (Create or update main category & subcategory).
  - `DELETE /api/admin/categories/<id>` (Disable category).
- [x] **Event Approval API**:
  - `GET /api/admin/events/pending` (Fetch pending events queue).
  - `PUT /api/admin/events/<id>/status` (Approve/Reject event status with comments).
- [ ] **Organizer KYC Verification API**:
  - `GET /api/admin/organizers/kyc-pending` (Fetch pending KYC submissions).
  - `PUT /api/admin/organizers/<id>/kyc-status` (Approve/Reject KYC status).

---

## Progress Log
- **Role Switching**: Role switcher verified in Profile screen (`MyProfile.js`) and Partner Portal modal (`OrganizerKYC` / `Exhibitor_Home`).
- **Terminal Error Fix**: Cleared `showRoleModal` syntax reference error in `Home.js`.
