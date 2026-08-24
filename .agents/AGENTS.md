# Project Guidelines & Behavioral Constraints

## 1. Category & Subcategory Management
- **Admin Panel Control**: Super Users / Admins can create, update, and manage Main Categories (e.g., Music, Sports, Tech, Food, Arts, Expo) and their nested Subcategories from the Admin Panel.
- **Organizer Event Creation**: When creating an event in Step 1 Details, Organizers must select a Main Category and a Subcategory. Organizers also have the ability to request or add a custom Category if needed.
- **Public & Attendee View**: Main Categories and Subcategories drive the dynamic filter pills, banners, and search filters on the Attendee Home Screen (`Home.js`) and All Events Feed (`AllEvents.js`).

## 2. Organizer Onboarding & KYC Rules
- **3-Step Onboarding Architecture**:
  - **Step 1**: Primary Representative Contact & Verification (Full Name, Primary Mobile, Alternate Mobile, Email Address with Email OTP Verification).
  - **Step 2**: Company & Business Legal Details (GST/PAN Number, Company Name, Official Business Address).
  - **Step 3**: Payout Bank Account Settlement (Bank Account Number, IFSC Code, Account Type).
- **Production vs. Development Phase Enforcement**:
  - **Production Requirement**: Full completion of all 3 onboarding/KYC steps is MANDATORY before an Organizer is permitted to create or publish an event.
  - **Development Phase Exemption**: For current development and testing, Organizers are allowed to create events even if Steps 2 & 3 are skipped, accompanied by a prominent warning banner explaining the production requirement.

## 3. Exhibitor Onboarding & Access Portal
- **Entry Point**: A dedicated "Exhibitor Portal — Vendor & Booth Onboarding" entry card/tab is available on the Home and Login screens alongside "List Your Show (Organizer)".
- **Exhibitor Flow**: Exhibitors register their business category, contact details, and products, gain access to `Exhibitor_Home`, select interactive floor plan stall booths, reserve stall spaces, and register booth staff passes.
