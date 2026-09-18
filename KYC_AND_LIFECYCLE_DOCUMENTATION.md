# KYC, Dual-Role Management & Event Lifecycle Documentation

This document records all architectural updates, database structures, business validation rules, and API changes implemented for dual-role accounts, KYC verification, event approvals, and stall reservations.

---

## 1. Database Schema & Data Models

### 1.1 `users` Table
- **Roles Storage**: Stored as a JSON array (`NVARCHAR(MAX)` in SQL Server, e.g. `["user", "organizer", "exhibitor"]`).
- **Active Role**: `active_role` indicates the currently active portal context (`"organizer"`, `"exhibitor"`, `"user"`, `"superadmin"`).
- **Soft Deletes**: Soft deletion uses `deleted_at: Mapped[Optional[datetime]]` (never use `is_deleted`). Active users satisfy `User.deleted_at.is_(None)`.
- **KYC Status**: `kyc_status` stores the combined account status (`"PENDING"`, `"VERIFIED"`, `"REJECTED"`, or `"NOT_REQUIRED"` for pure attendees).

### 1.2 `organizer_profiles` Table
- **Foreign Key**: `user_id -> users.id` (one-to-one per organizer role).
- **Key Fields**:
  - `company_name`: Business/Production corporate name.
  - `gstin`: GST identification number (e.g., `33ABCDE1234F1Z5`).
  - `pan_number`: Income tax PAN number (e.g., `ABCDE1234F`).
  - `account_number`: Payout bank account number.
  - `ifsc_code`: Bank branch IFSC code.
  - `kyc_status`: `"PENDING"` | `"VERIFIED"` | `"REJECTED"`.
  - **Default**: `"PENDING"` (changed from `"VERIFIED"` to ensure proper audit).

### 1.3 `exhibitor_profiles` Table
- **Foreign Key**: `user_id -> users.id` (one-to-one per exhibitor role).
- **Key Fields**:
  - `company_name`: Exhibiting entity / stall brand name.
  - `gstin`: GST identification number.
  - `pan_number`: Income tax PAN number.
  - `account_number`: Bank account number.
  - `ifsc_code`: Bank branch IFSC code.
  - `kyc_status`: `"PENDING"` | `"VERIFIED"` | `"REJECTED"`.
  - **Default**: `"PENDING"`.

---

## 2. Core Business Validation Rules

### 2.1 Dual-Role Architecture (Single Login, Separate Profiles)
- A single user account (`users.id`) can hold both `organizer` and `exhibitor` roles simultaneously.
- When an existing Organizer upgrades/applies for Exhibitor status (or vice versa):
  - Shared legal information (GST, PAN, Bank Details) is pre-filled for user convenience.
  - **All pre-filled fields remain 100% editable** so exhibitors can use a different business name, GST, or bank account if desired.
  - Each role maintains its own dedicated profile and independent KYC status in the database.

### 2.2 Common User (Attendee) No-KYC Rule
- Users who only register to browse events and buy passes/tickets require **no KYC verification**.
- They are excluded from the Pending KYC queue and are listed under the **Attendees** tab as `Active Member` with `Not Required` KYC status.

### 2.3 Event Creation vs. Event Approval
- **Event Creation**: Organizers with `PENDING` KYC **CAN** draft and create events.
- **Event Approval & Publishing**: Super Admins **CANNOT** approve or publish an event if the organizer's business KYC is `PENDING`.
  - Backend returns HTTP `400 Bad Request` with an explanatory error.
  - Frontend disables the `Approve` button and renders an amber warning alert with a 1-click link to the KYC verification panel.
  - Once the Super Admin verifies the Organizer KYC, event approval immediately unlocks.

### 2.4 Stall Booking Lock for Exhibitors
- Exhibitors with `PENDING` KYC **CAN** browse expos and view stall layouts.
- Exhibitors **CANNOT** reserve or book stalls until their Exhibitor KYC is `VERIFIED`.
  - Backend returns HTTP `403 Forbidden` if `ExhibitorProfile.kyc_status != "VERIFIED"`.
  - Frontend renders a warning banner on the Stall Reservation page and disables the `Reserve Stall` button.

---

## 3. Backend Implementation Details

### 3.1 Default Status Correction
- **File**: [`Backend_page/app/modules/auth/repository/auth_repository.py`](file:///d:/personal/eventapp/Backend_page/app/modules/auth/repository/auth_repository.py)
- **Functions Modified**:
  - `create_organizer_user`: Default `kyc_status="PENDING"`.
  - `attach_organizer_profile`: Default `kyc_status="PENDING"`.
  - `create_exhibitor_user`: Default `kyc_status="PENDING"`.
  - `attach_exhibitor_profile`: Default `kyc_status="PENDING"`.

### 3.2 Super Admin User Query & Pending Queue
- **File**: [`Backend_page/app/modules/admin/services/admin_service.py`](file:///d:/personal/eventapp/Backend_page/app/modules/admin/services/admin_service.py)
- **Method**: `AdminService.get_all_users(search, role, kyc_status, page, limit)`:
  - **Attendee Filter**: When `role in ["user", "attendee", "attendees"]`, filters out accounts containing `"organizer"` or `"exhibitor"` in `roles`.
  - **Pending KYC Filter**: When `kyc_status == "PENDING"`, scopes to users with organizer or exhibitor roles where either `OrganizerProfile.kyc_status == "PENDING"` or `ExhibitorProfile.kyc_status == "PENDING"`.
  - **Response Payload**: Returns `organizer_kyc`, `exhibitor_kyc`, `organizer_company`, `exhibitor_company`, `is_organizer`, `is_exhibitor`, `is_common_user`, and combined `kyc_status`.

### 3.3 Role-Targeted KYC Updates
- **File**: [`Backend_page/app/modules/admin/schemas/admin_schema.py`](file:///d:/personal/eventapp/Backend_page/app/modules/admin/schemas/admin_schema.py)
  - `UpdateKycStatusSchema`: Added `role: Optional[str] = None` (`"organizer"`, `"exhibitor"`, or `"both"`).
- **File**: [`Backend_page/app/modules/admin/services/admin_service.py`](file:///d:/personal/eventapp/Backend_page/app/modules/admin/services/admin_service.py)
  - `AdminService.update_organizer_kyc_status`: Updates only the targeted profile's status and recomputes the combined `User.kyc_status`.

### 3.4 Event Approval Guard
- **File**: [`Backend_page/app/modules/admin/services/admin_service.py`](file:///d:/personal/eventapp/Backend_page/app/modules/admin/services/admin_service.py)
  - `AdminService.update_event_status`: When `status in ["APPROVED", "ACTIVE"]`, verifies that the event organizer has `OrganizerProfile.kyc_status == "VERIFIED"`.

### 3.5 Stall Booking Guard
- **File**: [`Backend_page/app/modules/exhibitors/services/exhibitor_service.py`](file:///d:/personal/eventapp/Backend_page/app/modules/exhibitors/services/exhibitor_service.py)
  - `ExhibitorService.book_stall`: Checks `ExhibitorProfile.kyc_status == "VERIFIED"`. Rejects reservation with HTTP `403` if pending.

---

## 4. Frontend Implementation Details

### 4.1 KYC & Verification Page
- **File**: [`Frontend_page/src/features/admin/kyc/pages/KycVerificationPage.jsx`](file:///d:/personal/eventapp/Frontend_page/src/features/admin/kyc/pages/KycVerificationPage.jsx)
  - **Role Chips**: Displays visual badges for `🎪 Organizer`, `🏪 Exhibitor`, and `👤 Attendee`.
  - **Dual KYC Status**: For dual-role accounts, shows both `Org: [VERIFIED/PENDING]` and `Exh: [VERIFIED/PENDING]`.
  - **Targeted Action Buttons**: Allows approving `[Approve Org]`, `[Approve Exh]`, or `[Approve Both]`.
  - **Attendee Presentation**: Marked as `Active Member` with `Not Required` status.

### 4.2 Event Approval Queue & Event Inspection Pages
- **Files**:
  - [`Frontend_page/src/features/admin/approvals/pages/EventApprovalQueuePage.jsx`](file:///d:/personal/eventapp/Frontend_page/src/features/admin/approvals/pages/EventApprovalQueuePage.jsx)
  - [`Frontend_page/src/features/superuser/pages/EventInspectionDetailPage.jsx`](file:///d:/personal/eventapp/Frontend_page/src/features/superuser/pages/EventInspectionDetailPage.jsx)
- **Features**:
  - Displays `⚠️ Org KYC Pending` warning chip.
  - Disables the `Approve` button and changes label to `KYC Pending`.
  - Displays an informative warning banner directing Super Admin to verify the organizer's KYC first.

### 4.3 Stall Reservation Page
- **File**: [`Frontend_page/src/features/exhibitor/pages/StallBookingPage.jsx`](file:///d:/personal/eventapp/Frontend_page/src/features/exhibitor/pages/StallBookingPage.jsx)
  - Detects if `user.profiles.exhibitor.kyc_status !== "VERIFIED"`.
  - Renders top notification banner: `Exhibitor Business KYC Verification Pending`.
  - Disables the `Reserve Stall` button with text `KYC Pending Approval`.

---

## 5. Automated Verification Checklist

All 12 validation scenarios have been tested and passed:
1. `[TEST 1]` User account retrieval and role resolution.
2. `[TEST 2]` Resetting Organizer & Exhibitor KYC to `PENDING`.
3. `[TEST 3]` User properly detected in Super Admin `PENDING` KYC query.
4. `[TEST 4]` Attendee filter cleanly isolates common users without organizer/exhibitor accounts.
5. `[TEST 5]` Event approval blocked when organizer KYC is `PENDING`.
6. `[TEST 6]` Stall booking blocked when exhibitor KYC is `PENDING`.
7. `[TEST 7]` Selective approval of Organizer KYC succeeds.
8. `[TEST 8]` Org KYC marked `VERIFIED` while Exhibitor KYC remains `PENDING`.
9. `[TEST 9]` Event approval succeeds once organizer KYC is `VERIFIED`.
10. `[TEST 10]` Stall booking remains blocked while Exhibitor KYC is `PENDING`.
11. `[TEST 11]` Selective approval of Exhibitor KYC succeeds.
12. `[TEST 12]` Frontend builds cleanly (`npm run build` completed in 23.35s with 0 errors).
