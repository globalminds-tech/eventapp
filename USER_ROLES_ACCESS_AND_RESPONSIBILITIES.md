# Master Specification: User Roles, Access & Functionality Matrix

> **Platform**: BookMyEvent (React Native Mobile App & Python Flask Backend)  
> **Status**: Updated Baseline & Rule Specification  
> **Target**: 4 Distinct User Roles (Attendee, Organizer, Exhibitor, Super User)

---

## 1. Executive Role Architecture & Access Hierarchy

```
                               ┌──────────────────────────────────────────┐
                               │  SUPER USER / PLATFORM ADMIN             │
                               │  - Platform Governance & Event Approval  │
                               │  - Category & Subcategory Master Control │
                               │  - Global Commission & Payout Settlement │
                               └────────────────────┬─────────────────────┘
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 │                                                                     │
  ┌──────────────▼──────────────────────────┐                       ┌──────────────────▼──────────────────────┐
  │  ORGANIZER / EVENT PRODUCER             │                       │  EXHIBITOR / STALL VENDOR               │
  │  - 3-Step Onboarding (Email OTP Verified)│                       │  - Dedicated Exhibitor Portal Entry     │
  │  - 7-Step DIY Event Creation Wizard    │                       │  - Stall Floor Plan Booking             │
  │  - Category/Subcategory + Custom Add    │                       │  - Lead Retrieval & Spot Registration   │
  │  - Gate Entry, QR Scanner & Analytics   │                       │  - Product Showcase & Booking History   │
  └──────────────┬──────────────────────────┘                       └─────────────────────────────────────────┘
                 │
  ┌──────────────▼──────────────────────────┐
  │  ATTENDEE / PUBLIC USER                 │
  │  - Category & Subcategory Event Browsing│
  │  - Ticket Purchase & QR Pass Generation │
  │  - Self-Service Booking Management      │
  └─────────────────────────────────────────┘
```

---

## 2. Special Rules & Architectural Clarifications

### A. Category & Subcategory Hierarchy Management
1. **Admin Master Control**: Super Users can add, edit, or disable Main Categories (e.g., Music, Sports, Tech, Food, Arts, Expo) and their Subcategories (e.g., Sports → Football, Cricket, Marathon, Esports) from the Admin Panel.
2. **Organizer Event Creation**: During Step 1 Event Details, Organizers select a Main Category and Subcategory. If an Organizer needs a custom category, they can click `+ Add Custom Category` to specify custom main/subcategory parameters.
3. **Public / Attendee View**: Main Category pills drive top-level event filtering on `Home.js`. Selecting a Main Category displays secondary Subcategory pills for fine-grained event discovery on `Home.js` and `AllEvents.js`.

### B. Organizer Onboarding & KYC Rules
1. **3-Step Onboarding Architecture**:
   - **Step 1: Representative Contact & Verification**: User Full Name, Primary Mobile Number, Alternate Mobile Number, Email Address + Email OTP Verification trigger.
   - **Step 2: Company & Representative Legal Details**: Company Legal Name, GST/PAN Registration, Business Address.
   - **Step 3: Payout Bank Account Settlement**: Bank Account Number, IFSC Code, Account Type (Current/Savings), Bank Name.
2. **Production vs. Development Enforcement**:
   - **Production Requirement**: Organizers MUST complete all 3 onboarding steps before being allowed to publish an event.
   - **Development Phase Exemption**: In current development/testing phase, Organizers can create events even if Steps 2 & 3 are skipped, accompanied by a dev phase warning banner.

### C. Exhibitor Onboarding & Login Portal
1. **Dedicated Entry Point**: Exhibitors have a distinct portal link on the Home and Login screens (**"Exhibitor Portal — Vendor & Booth Onboarding"**) alongside "List Your Show (Organizer)".
2. **Exhibitor Flow**: Business category registration (F&B, Tech, Apparel, Crafts, Corporate), product description, direct access to `Exhibitor_Home`, stall space selection on interactive floor plans, checkout, and staff QR pass generation.

---

## 3. Deep Dive: 4 User Roles & Functional Matrix

---

### Role 1: Public / Attendee User (`USER`)

#### A. Persona & Role Definition
The end-consumer/ticket buyer visiting the BookMyEvent platform to discover, book, and attend live events.

#### B. Full Screen & Functionality List

| Screen Name | Route (`App.js`) | Functionality & Capabilities |
| :--- | :--- | :--- |
| **Home Screen** | `Home` | • Main Category pills (Music, Sports, Tech, Arts, Expo, Food) with subcategory pills.<br>• Dynamic pastel header backgrounds & search bar.<br>• Trending Events carousel & Featured Cards grid. |
| **All Events Feed** | `AllEvents` | • Filterable list by Main Category, Subcategory, Location, Date, and Price. |
| **Event Details** | `EventDetail` | • Rich visual hero media, event agenda, venue map pin, Ticket Tier Selection (VIP, General, Student), and CTA trigger. |
| **User Bookings & QR Pass** | `UserBooking` | • Active & past ticket history list, digital QR ticket pass, downloadable receipt, cancellation request. |
| **QR Code Validator** | `QRValidation` | • QR ticket self-check tool. |
| **Login & Auth** | `Login`, `Register`, `Forgetpsw` | • Email/Phone OTP login & Registration, password recovery. |

---

### Role 2: Event Organizer / Production Host (`ORGANIZER`)

#### A. Persona & Role Definition
The event creator and host managing event setup, ticket inventory, live gate scanners, vendor master, and direct payouts.

#### B. Full Screen & Functionality List

| Category | Screen Name & Route | Functionality & Capabilities |
| :--- | :--- | :--- |
| **Onboarding & Verification** | `OrganizerWelcome`<br>`OrganizerKYC` | • **Step 1**: Contact Details (Full Name, Primary Mobile, Alternate Mobile, Email + Email OTP Verification).<br>• **Step 2**: Company Legal Details (GST/PAN).<br>• **Step 3**: Direct Payout Bank Account.<br>• Dev phase skip option with production enforcement warning. |
| **Event Creation Wizard** | `CreateEvent` | • **7-Step Setup**: Step 1 Details (Main Category & Subcategory selection + Custom Category add option) → Step 2 Schedule → Step 3 Ticket Tiers → Step 4 Media → Step 5 Stall Layout → Step 6 Policy → Step 7 Visual Summary Preview. |
| **Live Gate Entry & Scanners** | `EventCheckIn`<br>`FoodCheckIn`<br>`AddonCheckIn` | • Gate entry QR scanner modal, Food Check-In (Breakfast/Lunch/Dinner & Veg/Non-Veg), Add-On Perk redemption. |
| **Live Sales & Analytics** | `LiveDashboard`<br>`LiveFoodDashboard` | • Real-time Gross Revenue cards, Tickets Sold progress track, Occupancy % gauge, VIP vs Gen Admission breakdown, live gate stream. |
| **Master Data Management** | `Venu`<br>`Vendor`<br>`SponsorshipPage` | • Location master, Vendor master (Caterers, AV, Security), Sponsorship tiers (Title, Platinum, Gold). |
| **Staff Roles & Access** | `RoleScreen` | • Role presets (Super Admin, Event Manager, Gate Staff, Accounts Manager), permission matrix (View, Create, Edit, Delete). |

---

### Role 3: Exhibitor / Stall Vendor (`EXHIBITOR`)

#### A. Persona & Role Definition
Vendors, brand sponsors, food stall operators, and corporate exhibitors participating in an event to showcase products, sell merchandise, or capture attendee leads.

#### B. Full Screen & Functionality List

| Screen Name | Route (`App.js`) | Functionality & Capabilities |
| :--- | :--- | :--- |
| **Exhibitor Portal Entry** | `Login`, `Home` | • Dedicated "Exhibitor Portal — Vendor & Booth Onboarding" entry point. |
| **Exhibitor Home** | `Exhibitor_Home` | • Overview of booked stalls, upcoming exhibition events, lead generation count. |
| **Upcoming Events** | `UpcomingEvent` | • Browse events offering stall spaces, filter by industry, booth size (3x3m, 6x3m), and venue location. |
| **Stall Booking** | `BookStall` | • Interactive floor plan stall selection, choose stall type (Corner, Shell Scheme, Bare Space), checkout & reservation. |
| **My Bookings & Passes** | `MyBookings` | • List of reserved stall spaces with invoice downloads and staff QR passes. |
| **Spot Visitor Registration** | `ExhibitorSpotRegistration`<br>`Exhibitor` | • On-site visitor lead capture form (Name, Email, Phone, Company) and instant booth pass issuance. |

---

### Role 4: Super User / Platform Administrator (`SUPER_USER`)

#### A. Persona & Role Definition
Platform system administrators responsible for global governance, category management, event approvals, organizer payout releases, and commission management.

#### B. Full Screen & Functionality List

| Module | Screen Name & Route | Functionality & Capabilities |
| :--- | :--- | :--- |
| **Super Admin Command Center** | `Super_user_Home` | • Global platform summary: Total Revenue, Total Events, Total Organizers, Pending Approvals. |
| **Category & Subcategory Master** | `Super_user_Home` | • Add, edit, or disable Main Categories (Music, Sports, Tech, etc.) and nested Subcategories. |
| **Event Verification & Moderation** | `AdminApproval`<br>`VerifyEvent` | • Review newly created events, approve or reject with comments, content moderation. |
| **Organizer KYC & Settlement** | `AdminApproval`<br>`Billing` | • Verify organizer company documents and release direct payouts post-event. |
