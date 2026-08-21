# EventApp Comprehensive Flow-Wise Analysis Report

This document provides a detailed breakdown of completed features, partially implemented features, and pending work across **Backend_page** and **Mobile_App** in the **BookMyEvent / EventApp** project.

---

## 1. Overview of System Roles & Architecture

The system supports 4 primary user roles:
1. **Organizer**: Creates events, configures venues, vendors, sponsors, policies, stall layouts, ticket packages, programs, coupons, manages staff roles, and handles day-of-event check-ins and live dashboards.
2. **Exhibitor**: Browses approved events, selects stalls from interactive hall layouts, submits stall bookings with company credentials, and tracks booking/payment approval status.
3. **User (Attendee)**: Browses published events, views detailed schedules/exhibitors, books passes and add-ons, generates encrypted QR entry tickets, and validates entry at venue gates.
4. **Admin (Super Admin / Super User)**: Oversees global platform state, verifies and approves/rejects submitted events, manages global master registries (venues, vendors, sponsors, policies), oversees global user accounts and stall booking overrides.

---

## 2. Role-by-Role Detailed Flow Analysis

### 👑 Flow 1: ORGANIZER ROLE

#### 1. Account Setup & Authentication
- **Status**: **Completed**
- **Backend (`Backend_page`)**: `/auth/api/login`, `/auth/api/register`, `/auth/api/logout`, `/otp/send-otp`, `/otp/verify-otp`, `/otp/resend-otp`, `/otp/reset-password`.
- **Mobile App (`Mobile_App`)**: `Login.js`, `Register.js`, `Forgetpsw.js`, `Forgetpsw1.js`. Connected to API.
- **My Profile (`MyProfile.js`)**: Connected to `/superadmin/api/user/profile/<id>` and `/update_profile`. Supports updating name, phone, organization, address, and profile photo.

#### 2. Master Data Management
- **Status**: **Completed**
- **Venues (`VenueList.js`)**: Full CRUD operations + Excel/PDF exports connected to `/superadmin/api/*_venue*`.
- **Vendors (`Vendor.js`)**: Full CRUD operations + Excel/PDF exports connected to `/superadmin/api/*_vendor*`.
- **Sponsors (`Sponsorship.js`)**: Full CRUD operations + Excel/PDF exports connected to `/superadmin/api/*_sponsor*`.
- **Policies (`policy.js`)**: Full CRUD operations + Excel/PDF exports connected to `/superadmin/api/*_policy*`.

#### 3. Event Creation Workflow (`CreateEvent.js` - Multi-step Wizard)
- **Status**: **Completed**
- **Step 1: Basic Event Details**: Title, category, start/end dates, venue selection, organizer ID, location. Connected to backend.
- **Step 2: Booking Settings**: Pricing, ticket capacity, booking window. Connected to backend.
- **Step 3: Stall & Hall Layout**: Multi-hall setup, row/column grid layout, stall pricing tiers (Standard, Premium, VIP), stall numbers. Connected to backend.
- **Step 4: Document Uploads**: File upload for permits, banners, event documentation. Connected to `/superadmin/upload/all-docs`.
- **Step 5: Terms & Conditions**: Assigning venue policies and custom terms. Connected to `/superadmin/api/save-terms`.
- **Step 6: Vendor & Sponsor Assignment**: Mappings of vendors and sponsors. Connected to `/superadmin/api/save-vendors-sponsors`.
- **Step Food Details & Vehicle Pass Details**: Food token inclusion and vehicle passes configuration. Connected to backend.
- **Final Submit & Verification Request**: Sets event status to `'Pending'` via `/superadmin/event/final-submit`.

#### 4. Event Approval & Status Tracking
- **Status**: **Completed**
- **Organizer Event List (`EventsPage.js`, `VerifyEvent.js`)**: Shows organizer's events with status badges (`Pending`, `Approved`, `Rejected`).

#### 5. Program & Agenda Management
- **Status**: **Completed**
- **Create Program (`CreateProgram.js`)**: Session creation, speaker details, timing. Connected to `/superadmin/api/programs`.
- **Program Verification (`program_verification.js`)**: Reviewing proposed program sessions.
- **Abstract Submissions (`Abstract.js`)**: Handling paper/abstract submissions for conferences. Connected to `/superadmin/api/abstract`.

#### 6. On-Site Operations & Check-in System
- **Status**: **Mostly Completed (1 Pending Backend Integration)**
- **Gate Entry QR Check-in (`EventCheckinCheckout.js`, `QRValidation.js`)**: Camera QR scanner validating pass codes via `/user/validate-qr/<booking_id>` and `/api/checkins`. (**Completed**)
- **Food Token Redemption (`FoodCheckinCheckout.js`)**: Real-time food token redemption scanner via `/superadmin/api/live_food_count`. (**Completed**)
- **Program Entry Check-in (`ProgramCheckin.js`)**: Track attendees entering specific halls. (**Completed**)
- **Add-on Item Check-in (`AddonCheckinout.js`)**: UI scanner implemented (**Pending backend connection - currently uses mock fallback data**).
- **Live Dashboards (`LiveDashboard.js`, `LiveFooddashboard.js`)**: Real-time entry counters, headcounts, food redemption statistics. (**Completed**)

#### 7. Operations, Financials & Analytics
- **Status**: **Partially Completed**
- **Exhibitor Spot Registration (`ExhibitorSpotRegistration.js`)**: On-site stall booking for walk-in exhibitors. (**Completed**)
- **Sub-user & Staff Role Management (`UserScreen.js`, `Rolescreen.js`, `User.js`, `Exhibitor.js`)**: UI screens implemented (**Backend fine-grained role-based access permissions pending refinement**).
- **Todo Task Checklist (`TodoTask.js`)**: Task list with backend persistent storage (`/superadmin/api/get-tasks` & `/create-tasks`). (**Completed**)
- **Broadcast Messages & Greetings (`MessagesGreeting.js`)**: CRUD for event notifications. (**Completed**)
- **Coupons & Discounts (`Coupon.js`)**: Coupon code creation. (**Completed**)
- **Event Reports (`EventReports.js`)**: Visual summaries and exportable reports. (**Completed**)
- **My Plan & Billing (`MyPlan.js`, `Billing.js`, `Receipt.js`)**: Account subscription UI (**Payment gateway for plan purchase is mock/simulated**).

---

### 🏪 Flow 2: EXHIBITOR ROLE

#### 1. Dashboard & Onboarding
- **Status**: **Completed**
- **Auth & Role**: Exhibitor login with `role = 'Exhibitor'`.
- **Exhibitor Home (`Exhibitor_Home.js`)**: Stats overview for total stalls booked, pending approvals, upcoming events.

#### 2. Event & Stall Browsing
- **Status**: **Completed**
- **Upcoming Events (`UpcomingEvent.js`)**: Lists published approved events accepting stall bookings with filter options.

#### 3. Interactive Stall Selection & Booking (`Stall_Booking.js`)
- **Status**: **Completed**
- **Interactive Hall Grid**: Hall selection tabs, visual interactive layout grid showing available, reserved, and booked stalls.
- **Stall Reservation Form**: Form collecting company details, GSTIN, stall description, logo upload.
- **Backend Integration**: Submits multipart form payload to `/exhibitor/api/book-stall`.

#### 4. Booking & Approval Tracking (`Mybooking.js`)
- **Status**: **Completed**
- **My Bookings View**: List of all applied stall bookings with status indicators (`Pending Approval`, `Approved`, `Rejected`, `Cancelled`).
- **Invoice & Details**: View allocated stall numbers, hall location, payment status.

#### 5. Exhibitor Pending Items
- ❌ **Booth Lead Scanner**: On-site QR scanner for exhibitors to scan attendee badges at their booth to collect leads (**Not implemented**).
- ⚠️ **Payment Gateway**: Live payment gateway integration for stall booking payments (**Simulated / mock payment confirmation**).

---

### 🎟️ Flow 3: USER (ATTENDEE) ROLE

#### 1. Authentication & Onboarding
- **Status**: **Completed**
- Login, Registration with OTP, Password Recovery.

#### 2. Event Discovery & Browsing
- **Status**: **Completed**
- **Home Screen (`Home.js`)**: Promotional banner carousel, featured events, event categories, search bar.
- **All Events Directory (`AllEvents.js`)**: Searchable list of all approved events with city/date filters.
- **Event Details (`EventDetail.js`)**: Complete overview, schedule, venue map, sponsor list, exhibitor list, ticket options.

#### 3. Ticket & Pass Booking Flow (`UserBooking.js`)
- **Status**: **Completed**
- **Pass Selection**: Standard, VIP, Day pass selection with quantity selectors.
- **Add-on Options**: Food tokens, workshop passes, parking slots.
- **Contact Info & Checkout**: Primary contact details, total price calculation, submission via `/user/book-event`.

#### 4. Digital Ticket Pass & QR Validation
- **Status**: **Completed**
- **Digital Pass View**: Generates digital pass with embedded encrypted QR code containing booking ID.
- **Entry Scanner (`QRValidation.js`)**: Gatekeepers scan pass QR -> Backend validates `/user/validate-qr/<booking_id>` -> Returns validation status (`Valid Entry`, `Already Checked In`, `Invalid Pass`).

#### 5. Attendee Pending Items
- ⚠️ **Live Payment Gateway**: In-app Razorpay/Stripe SDK integration for ticket payments (**Currently simulated via mock confirmation**).
- ❌ **Push Notifications**: Firebase Cloud Messaging (FCM) integration for event reminders and schedule updates (**Pending**).

---

### ⚙️ Flow 4: ADMIN (SUPER ADMIN / SUPER USER) ROLE

#### 1. Admin Dashboard & System Oversight
- **Status**: **Completed**
- **Dashboard (`Super_user_Home.js`)**: Global metrics summary: Total Events, Organizers, Exhibitors, Revenue, Pending Approvals.

#### 2. Event Review & Approval Workflow
- **Status**: **Completed**
- **Pending Events List**: Connected to `/superuser/get-events`.
- **Full Event Audit View**: Connected to `/superuser/event-full-details/<event_id>` to view basic details, hall layout, stall pricing, tickets, vendor/sponsor assignments, uploaded compliance documents.
- **Status Toggle**: Update event status (`'Approved'`, `'Rejected'`, `'Suspended'`) via `/superuser/update-status/<event_id>`.

#### 3. Global Master Data & System Management
- **Status**: **Completed**
- Global registries for Venues, Vendors, Sponsors, Policies.
- Global stall booking review & status override (`/superadmin/api/admin/bookings`, `/superadmin/api/admin/update-booking-status/<id>`).
- Global complaint desk and feedback management (`/superadmin/api/complaints`, `/superadmin/api/feedbacks`).

#### 4. Admin Pending Items
- ❌ **Automated Commission & Payout System**: Module to calculate and settle ticket/stall sales commissions to organizers (**Pending**).
- ❌ **Admin Audit Log Visualizer**: UI screen for reviewing system security logs and API access logs (**Backend logs exist, UI pending**).

---

## 3. Summary Matrix (Completed vs. Pending)

| Role | Module / Sub-Flow | Backend API (`Backend_page`) | Mobile App UI (`Mobile_App`) | API Integration | Overall Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Organizer** | Auth (Login, Register, OTP, Reset Pass) | ✅ Complete | ✅ Complete | ✅ Connected | **Completed** |
| **Organizer** | Master Data (Venues, Vendors, Sponsors, Policies) | ✅ Complete | ✅ Complete | ✅ Connected | **Completed** |
| **Organizer** | Event Creation 6-Step Wizard | ✅ Complete | ✅ Complete | ✅ Connected | **Completed** |
| **Organizer** | Program & Schedule Management | ✅ Complete | ✅ Complete | ✅ Connected | **Completed** |
| **Organizer** | Gate Entry & Food QR Check-in | ✅ Complete | ✅ Complete | ✅ Connected | **Completed** |
| **Organizer** | Add-on Check-in | ⚠️ Partial | ✅ Complete | ⚠️ Mock Fallback | **Pending Backend API** |
| **Organizer** | Sub-user Staff Roles | ⚠️ Basic API | ✅ Complete | ⚠️ RBAC Pending | **Partial** |
| **Organizer** | My Plan & Subscriptions | ❌ No Payment | ✅ Complete | ⚠️ Simulated | **Pending Payment Gateway** |
| **Exhibitor** | Auth & Exhibitor Profile | ✅ Complete | ✅ Complete | ✅ Connected | **Completed** |
| **Exhibitor** | Upcoming Events Browsing | ✅ Complete | ✅ Complete | ✅ Connected | **Completed** |
| **Exhibitor** | Interactive Stall Selection & Booking | ✅ Complete | ✅ Complete | ✅ Connected | **Completed** |
| **Exhibitor** | My Bookings & Approval Status | ✅ Complete | ✅ Complete | ✅ Connected | **Completed** |
| **Exhibitor** | Booth Lead Scanner | ❌ Missing | ❌ Missing | ❌ Missing | **Pending Feature** |
| **Attendee** | Event Discovery & Search/Filters | ✅ Complete | ✅ Complete | ✅ Connected | **Completed** |
| **Attendee** | Event Details & Schedules | ✅ Complete | ✅ Complete | ✅ Connected | **Completed** |
| **Attendee** | Ticket/Pass Booking Flow | ✅ Complete | ✅ Complete | ✅ Connected | **Completed** |
| **Attendee** | Digital Pass & QR Code Entry | ✅ Complete | ✅ Complete | ✅ Connected | **Completed** |
| **Attendee** | Payment Gateway Integration | ❌ Simulated | ⚠️ Mock UI | ⚠️ Simulated | **Pending Payment Gateway** |
| **Attendee** | Push Notifications (FCM) | ❌ Missing | ❌ Missing | ❌ Missing | **Pending Feature** |
| **Admin** | Dashboard & Metrics | ✅ Complete | ✅ Complete | ✅ Connected | **Completed** |
| **Admin** | Event Audit & Approval / Rejection | ✅ Complete | ✅ Complete | ✅ Connected | **Completed** |
| **Admin** | Master System Registries | ✅ Complete | ✅ Complete | ✅ Connected | **Completed** |
| **Admin** | Automated Organizer Commission Payouts | ❌ Missing | ❌ Missing | ❌ Missing | **Pending Feature** |
| **Admin** | System Audit Log Viewer | ⚠️ Logs Only | ❌ Missing | ❌ Missing | **Pending UI** |

---

## 4. Priority Recommendation Checklist for Next Steps

To make the application 100% production-ready, the following pending items should be addressed in order of priority:

1. **Payment Gateway Integration (High Priority)**
   - Integrate Razorpay or Stripe SDK in `Mobile_App` for Attendee ticket purchase, Exhibitor stall payment, and Organizer plan subscriptions.
2. **Add-on Check-in Endpoint (Medium Priority)**
   - Connect `AddonCheckinout.js` in `Mobile_App` to a dedicated backend endpoint instead of using the `DUMMY_DATA` fallback.
3. **Push Notifications (FCM) (Medium Priority)**
   - Configure Firebase Cloud Messaging for sending automated ticket confirmations, schedule alerts, and event updates.
4. **Exhibitor Booth Lead Scanner (Low / Feature Enhancement)**
   - Add a QR scanner feature in `Exhibitor_Home.js` allowing exhibitors to scan attendee entry passes at their booth to collect attendee contact leads.
5. **Automated Organizer Payout System (Low / Admin Enhancement)**
   - Build automated settlement tracking for calculating platform commissions vs. organizer net payouts.
