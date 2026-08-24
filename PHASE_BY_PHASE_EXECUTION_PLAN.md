# Master Execution Plan: Top-Down Role Sequence & Shadcn UI Architecture

> **Platform**: BookMyEvent (React Native Mobile App & Python Flask Backend)  
> **Execution Strategy**: Top-Down Architecture (**Super Admin → Organizer → Exhibitor → Public User**)  
> **UI System**: Modular Shadcn-Inspired React Native Design System (`src/components/ui/`)

---

## 1. UI & Design System Architecture: Shadcn-inspired Primitives

To achieve a clean, modern aesthetic across all 4 user roles, we will build a centralized primitive UI component library in `src/components/ui/`:

```
src/components/ui/
├── Button.js        # Primary, Accent, Outline, Ghost, Danger button variants
├── Card.js          # Elevate, Bordered, Header, Content, Footer cards
├── Badge.js         # Status pills (Success, Warning, Danger, Info, VIP)
├── Input.js         # TextInput, SearchInput, PasswordInput with icon support
├── SelectModal.js   # Dropdown picker & search modal
├── Modal.js         # Slide/Fade dialog container
├── Tabs.js          # Segmented pill tabs & tab navigation
├── StatCard.js      # Metric counter cards with trend indicators
├── Header.js        # Top bar with back button & title
└── Toast.js         # Animated notification toasts
```

---

## 2. Top-Down Execution Roadmap

```
  [STEP 1: SUPER ADMIN]  ▶ Governance, Category & Subcategory Master, Event Approvals, Payout Release
            │
  [STEP 2: ORGANIZER]    ▶ 3-Step Email OTP Onboarding, 7-Step DIY Event Creation, Gate Scanners, Analytics
            │
  [STEP 3: EXHIBITOR]    ▶ Exhibitor Portal, Browse Exhibitions, Floor Plan Stall Booking, Lead Capture
            │
  [STEP 4: PUBLIC USER]  ▶ Category/Subcategory Browsing, Event Details, Ticket Checkout & QR Pass
```

---

## 3. Detailed Execution Steps

### STEP 1: Super Admin (Foundation & Master Control)
- [ ] Build Shadcn UI primitives (`Card.js`, `Button.js`, `Badge.js`, `Modal.js`, `Tabs.js`).
- [ ] **Category & Subcategory Master**: Add/Edit Main Categories (Music, Sports, Tech, Food, Arts, Expos) and Subcategories in Admin Panel + Flask API.
- [ ] **Event Approval Queue**: Review, Approve, or Reject Organizer events + Flask API endpoint.
- [ ] **Organizer KYC & Payout Release**: Verify company documents & approve payout settlements.

### STEP 2: Organizer (Event Production & Gate Operations)
- [ ] **3-Step Account Setup**: Contact Details + Email OTP Verification, Company Legal, Payout Bank Account + Flask API endpoint.
- [ ] **7-Step DIY Event Creation Wizard**: Select Main Category & Subcategory (or `+ Add Custom Category`), Schedule, Ticket Tiers, Media, Stall Layout, Policies, and Preview + Flask API endpoint.
- [ ] **Master Data**: Venue Master, Vendor Master, Sponsorship Tiers, RBAC Matrix.
- [ ] **Live Gate Scanners & Analytics**: Event Ticket QR Scan, Food Voucher Scan, Add-On Perks, Live Sales & Food Analytics Dashboards.

### STEP 3: Exhibitor (Vendor & Booth Booking)
- [ ] **Exhibitor Portal Onboarding**: Dedicated entry point on Login/Home.
- [ ] **Stall Discovery & Booking**: Browse exhibition events, interactive floor plan stall booth selection, checkout & reservation + Flask API endpoint.
- [ ] **My Bookings & Lead Capture**: Invoices, booth staff QR passes, on-site visitor lead capture form.

### STEP 4: Public / Attendee User (End-to-End Consumer Experience)
- [ ] **Dynamic Category Browsing**: Filter events by Main Category & Subcategory pills on `Home.js` & `AllEvents.js`.
- [ ] **Event Details & Ticket Booking**: Rich media, date/time, ticket tier selection, Razorpay payment integration.
- [ ] **Digital Ticket QR Pass & User Bookings**: Active & past ticket history, digital QR pass, refund requests.

---

## 4. Immediate Next Step
We will begin with **STEP 1: Super Admin**, creating the **Shadcn-inspired UI Component Library** and completing the **Super Admin Governance, Category & Subcategory Master, and Event Approval Queue** integrated with the Flask Backend.
