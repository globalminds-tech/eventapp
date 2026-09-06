# 🛡️ Role Creation & Permission Assignment Guide

This comprehensive guide provides step-by-step blueprints for manually configuring custom roles in the **Team & Access Control** portal for both **Organizers** (`/OrganizerHome/TeamManagement`) and **Exhibitors** (`/exhibitor/team`).

---

## 🔒 Tenant & Domain Isolation Rules

1. **Strict Multi-Tenant Separation**: Every role you create belongs strictly to your company organization. No other organizer or exhibitor will ever see your roles or team members.
2. **Dedicated Domain Screens**:
   - **Organizer Portal** provides screens for creating events, managing floor layouts, approving stall reservations, finance ledgers, venues, and team governance.
   - **Exhibitor Portal** provides screens for browsing upcoming expos, booking stalls, ordering booth amenities, scanning visitor leads, managing booth badges, invoices, and booth team delegation.
3. **Primary Owner Full Authority**: The account owner who registers and completes KYC possesses complete implicit control across their domain. You do not need an "Owner" role. Only create roles for employees, specialists, accountants, and booth representatives you plan to invite!
4. **Clean UI Experience**: All role screens and permission selectors display clean, human-readable titles and descriptions—no raw machine codes (like `checkin.scan` or `events.create`) are ever exposed in the user interface.

---

## 🚀 How to Add a Role in the UI
1. Navigate to **Team & Roles** from your workspace sidebar.
2. Select the **Roles & Permissions** tab.
3. Click the **`+ Create Custom Role`** button at the top right.
4. Enter the **Role Name** and **Short Description** from the blueprints below.
5. In the **Select Screen & Action Permissions** matrix, check the desired capabilities.
6. Click **Save Custom Role**.

---

# 🎪 PART A: ORGANIZER ROLE BLUEPRINTS

Use these blueprints when operating within your **Organizer** account (`/OrganizerHome/TeamManagement`).

### 1. 🎪 Event Manager
> **Best for:** Core event operations heads who oversee event programs, schedules, and stall configurations, without access to company banking, revenue ledgers, or payouts.

- **Role Name:** `Event Manager`
- **Short Description:** `Oversees event creation, schedules, stall configurations, and attendee check-ins without access to financial ledgers.`
- **Permissions to Select (14 permissions):**
  - **Events Management:**
    - [x] `View Events`
    - [x] `Create Events`
    - [x] `Edit Events`
    - [x] `Publish Events`
    - [x] `Delete Events`
  - **Stalls & Exhibitor Booths:**
    - [x] `View Stalls`
    - [x] `Create Stalls`
    - [x] `Edit Stalls`
    - [x] `Approve/Reject Stalls`
  - **Gate & Food Check-In:**
    - [x] `View Check-In Dashboard`
    - [x] `Scan Tickets & Badges`
  - **Venue & Hall Management:**
    - [x] `View Venues`
    - [x] `Manage Venues`
  - **Organization & Team Governance:**
    - [x] `View Team Members`

---

### 2. 💰 Finance & Payouts Officer
> **Best for:** Accountants, CFOs, or billing managers who need to track ticket revenue, verify exhibitor stall payments, download GST receipts, and process refunds.

- **Role Name:** `Finance & Payouts Officer`
- **Short Description:** `Manages financial ledgers, revenue audits, payout requests, GST invoices, and attendee refund approvals.`
- **Permissions to Select (5 permissions):**
  - **Finance, Billing & Payouts:**
    - [x] `View Finance`
    - [x] `Export Financial Data`
    - [x] `Issue Refunds`
  - **Events Management:**
    - [x] `View Events`
  - **Stalls & Exhibitor Booths:**
    - [x] `View Stalls`

---

### 3. 📱 Gate & Security Scanner
> **Best for:** Temporary gate volunteers, security guards, and scanning personnel at physical entry gates. They cannot see revenue, edit events, or access team rosters.

- **Role Name:** `Gate Security Scanner`
- **Short Description:** `Operational role for on-site gate staff to scan QR tickets and badges during expo days.`
- **Permissions to Select (3 permissions):**
  - **Gate & Food Check-In:**
    - [x] `View Check-In Dashboard`
    - [x] `Scan Tickets & Badges`
  - **Events Management:**
    - [x] `View Events`

---

### 4. 🏬 Stall & Exhibitor Coordinator
> **Best for:** Commercial partnership heads managing the expo floor plan, setting up booth pricing, and vetting exhibitor stall reservation requests.

- **Role Name:** `Stall & Exhibitor Coordinator`
- **Short Description:** `Manages booth layouts, reviews exhibitor booking applications, and configures stall inventory.`
- **Permissions to Select (7 permissions):**
  - **Stalls & Exhibitor Booths:**
    - [x] `View Stalls`
    - [x] `Create Stalls`
    - [x] `Edit Stalls`
    - [x] `Delete Stalls`
    - [x] `Approve/Reject Stalls`
  - **Events Management:**
    - [x] `View Events`
  - **Venue & Hall Management:**
    - [x] `View Venues`

---

### 5. 👥 Team & Operations Lead
> **Best for:** HR managers or department leads responsible for inviting staff, assigning operational responsibilities, and managing custom roles.

- **Role Name:** `Operations & Team Lead`
- **Short Description:** `Manages organization staff onboarding, role assignments, and team administrative operations.`
- **Permissions to Select (9 permissions):**
  - **Organization & Team Governance:**
    - [x] `View Team Members`
    - [x] `Invite Team Members`
    - [x] `Edit Team Members`
    - [x] `Remove Team Members`
    - [x] `View Roles`
    - [x] `Create Custom Roles`
    - [x] `Edit Custom Roles`
  - **Events Management:**
    - [x] `View Events`
  - **Venue & Hall Management:**
    - [x] `View Venues`

---

# 🏢 PART B: EXHIBITOR ROLE BLUEPRINTS

Use these blueprints when operating within your **Exhibitor** account (`/exhibitor/team`).

### 1. 🌟 Booth Manager
> **Best for:** Exhibition leads or marketing managers who oversee booth space, order amenities, handle lead distribution, and manage on-site booth staff.

- **Role Name:** `Booth Manager`
- **Short Description:** `Full managerial authority over booth reservation, amenities, lead generation, badges, and booth staff.`
- **Permissions to Select (13 permissions):**
  - **Upcoming Expos & Floorplans:**
    - [x] `Browse Upcoming Expos`
  - **Stall Bookings & Amenities:**
    - [x] `Book Expo Stalls`
    - [x] `View My Stalls`
    - [x] `Manage Stall Amenities`
  - **Visitor Leads & Badge Scanning:**
    - [x] `View Visitor Leads`
    - [x] `Export Leads (CSV/Excel)`
    - [x] `Scan Visitor Badges`
  - **Booth Staff & Badges:**
    - [x] `Manage Booth Staff & Badges`
  - **Invoices & Receipts:**
    - [x] `View Invoices & Receipts`
  - **Exhibitor Team & Roles:**
    - [x] `View Booth Team`
    - [x] `Invite Booth Staff`
    - [x] `Edit Booth Staff Roles`
    - [x] `Manage Custom Roles`

---

### 2. 🎯 Lead Capture & Demo Specialist
> **Best for:** Sales representatives and product specialists whose primary job is scanning visitor badges at the booth and engaging prospects.

- **Role Name:** `Lead Capture Specialist`
- **Short Description:** `Scans visitor badges at the booth, enters sales notes, and views captured prospect contacts.`
- **Permissions to Select (4 permissions):**
  - **Visitor Leads & Badge Scanning:**
    - [x] `Scan Visitor Badges`
    - [x] `View Visitor Leads`
  - **Upcoming Expos & Floorplans:**
    - [x] `Browse Upcoming Expos`
  - **Stall Bookings & Amenities:**
    - [x] `View My Stalls`

---

### 3. 🧾 Exhibitor Accounts & Billing Specialist
> **Best for:** Company accounts or procurement staff responsible for tracking stall invoices, GST receipts, and payment proofs for expo booths.

- **Role Name:** `Exhibitor Accounts Specialist`
- **Short Description:** `Tracks stall booking invoices, verifies tax payment proofs, and downloads receipts.`
- **Permissions to Select (3 permissions):**
  - **Invoices & Receipts:**
    - [x] `View Invoices & Receipts`
  - **Stall Bookings & Amenities:**
    - [x] `View My Stalls`
  - **Upcoming Expos & Floorplans:**
    - [x] `Browse Upcoming Expos`

---

### 4. 🤝 Booth Host / Receptionist
> **Best for:** Temporary booth greeters, interns, or product demonstrators who assist visitors and scan attendee QR codes for product literature distribution.

- **Role Name:** `Booth Host & Receptionist`
- **Short Description:** `Greets visitors at the booth, scans entry badges for product brochures, and assists floor visitors.`
- **Permissions to Select (3 permissions):**
  - **Visitor Leads & Badge Scanning:**
    - [x] `Scan Visitor Badges`
  - **Stall Bookings & Amenities:**
    - [x] `View My Stalls`
  - **Upcoming Expos & Floorplans:**
    - [x] `Browse Upcoming Expos`

---

## 📖 Master Reference Table of Permissions

### Organizer Domain (25 Permissions)

| Functional Module | Permission Name | Screen & Action Access Description |
| :--- | :--- | :--- |
| **Events Management** | `View Events` | Can view event listings, summary analytics, and event overview. |
| | `Create Events` | Can start and draft new events in the 7-step wizard. |
| | `Edit Events` | Can modify event dates, descriptions, programs, and tickets. |
| | `Publish Events` | Can publish events directly or submit for admin approval. |
| | `Delete Events` | Can soft-delete events from the organization catalog. |
| **Stalls & Exhibitor Booths** | `View Stalls` | Can inspect floor layouts, booth availability, and bookings. |
| | `Create Stalls` | Can add new stall tiers, dimensions, and standard pricing. |
| | `Edit Stalls` | Can adjust stall prices, amenities, and layout numbers. |
| | `Delete Stalls` | Can retire or delete stall inventory. |
| | `Approve/Reject Stalls` | Can review and approve/reject exhibitor booking applications. |
| **Gate & Food Check-In** | `View Check-In Dashboard` | Can view real-time gate entry counts, capacity, and graphs. |
| | `Scan Tickets & Badges` | Can use camera or handheld QR scanner to check in attendees. |
| **Finance, Billing & Payouts**| `View Finance` | Can view total ticket revenue, stall fees, and ledger summaries. |
| | `Export Financial Data` | Can export financial reports, GST invoices, and Excel sheets. |
| | `Issue Refunds` | Can approve and trigger ticket or stall reservation refunds. |
| **Organization & Team** | `View Team Members` | Can browse the list of active staff and organization members. |
| | `Invite Team Members` | Can dispatch tokenized email invitations to new team members. |
| | `Edit Team Members` | Can reassign staff roles, departments, and active statuses. |
| | `Remove Team Members` | Can remove or deactivate staff accounts from the organization. |
| | `View Roles` | Can view the organization's configured roles and scopes. |
| | `Create Custom Roles` | Can define new tailored operational roles from the UI. |
| | `Edit Custom Roles` | Can update permissions on existing custom roles. |
| | `Delete Custom Roles` | Can delete unassigned custom roles with assignment guards. |
| **Venue & Hall Management** | `View Venues` | Can browse the venue directory and facility specifications. |
| | `Manage Venues` | Can add venues, update floor layouts, and attach safety certs. |

---

### Exhibitor Domain (14 Permissions)

| Functional Module | Permission Name | Screen & Action Access Description |
| :--- | :--- | :--- |
| **Upcoming Expos** | `Browse Upcoming Expos` | Can search expo catalogs and view interactive floor layout maps. |
| **Stall Bookings** | `Book Expo Stalls` | Can submit stall booking requests and complete payment advances. |
| | `View My Stalls` | Can view confirmed and pending booth reservations and stall numbers. |
| | `Manage Stall Amenities` | Can request extra power outlets, furniture, LED walls, and Wi-Fi. |
| **Visitor Leads** | `View Visitor Leads` | Can view real-time list of visitors scanned at the booth. |
| | `Export Leads (CSV/Excel)` | Can download scanned visitor contact books into Excel or CRM format. |
| | `Scan Visitor Badges` | Can use phone camera / badge scanner to capture visitor details. |
| **Booth Staff & Badges** | `Manage Booth Staff & Badges` | Can register staff badges and entry passes for booth crew. |
| **Invoices & Receipts** | `View Invoices & Receipts` | Can view and download GST invoices, receipts, and payment proofs. |
| **Exhibitor Team** | `View Booth Team` | Can view all active booth members and representatives. |
| | `Invite Booth Staff` | Can invite new colleagues and representatives to the booth team. |
| | `Edit Booth Staff Roles` | Can change assigned roles or active/deactivated statuses. |
| | `Remove Booth Staff` | Can remove representatives from the exhibitor team. |
| | `Manage Custom Roles` | Can create and configure custom delegation roles for the booth. |
