# Project Guidelines, Completed Roadmap & Design System Standards

## 1. Scope & Execution Priority
- **Active Scope**: Web Application ONLY (FastAPI Backend `Backend_page` & React Web Frontend `Frontend_page`).
- **Deferred Scope**: Mobile Application (`Mobile_App`) is deferred until Backend and Frontend web functionalities are fully complete.
- **Immediate Anchor Workflow**: **Organizer Side — Event Creation & Management**. Event creation is the foundation; once events can be created, saved, published, and fetched reliably, subsequent workflows (Attendee Booking, Exhibitor Stall Reservation, Admin Approval) can be developed and tested end-to-end.

---

## 2. Design System & Design Continuity Standards

### 🎨 Core Color Tokens & Theme System
- **Sidebar Background**: Deep Dark Slate (`bg-[#0f172a] border-r border-slate-800 text-slate-300`).
- **Organizer Primary Accent**: Electric Cyan to Royal Blue Gradient (`bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-extrabold shadow-md shadow-cyan-500/25`).
- **Super Admin Accent**: Purple/Indigo Gradient (`bg-gradient-to-r from-purple-600 to-indigo-600 text-white`).
- **Exhibitor Accent**: Emerald/Teal Gradient (`bg-gradient-to-r from-emerald-600 to-teal-600 text-white`).
- **Canvas Viewport Background**: Slate Tint (`bg-[#f8fafc]`).
- **Card Containers**: White with subtle borders (`bg-white rounded-2xl border border-slate-200/80 shadow-xs`).

### 📐 Layout & Viewport Rules
- **Zero Vertical Scrolling Rule**: All form steps and dashboard views must manage spacing cleanly so information fits within standard screen viewports without requiring vertical page scrolling.
- **Spacious Responsive Grids**: Form fields must use clean 2-column or 4-column responsive grids (`grid grid-cols-1 lg:grid-cols-2 gap-6` or `grid-cols-2 md:grid-cols-4 gap-3`). Avoid cramped 3-column scrollable boxes that clip text.
- **In-Flow Action Footers**: Navigation buttons (`Previous Step`, `Next Step`, `Publish Event`) must be placed in-flow at the bottom of form card containers, NEVER using fixed floating footer overlays (`fixed bottom-0`).

### 📍 Progress Tracker Stepper Pattern
- All wizard steps must use a visual **Progress Tracker Bar** featuring:
  - Connecting background track line (`h-0.5 bg-slate-200`) with active gradient progress (`bg-gradient-to-r from-cyan-500 to-blue-600`).
  - Active step circles with glowing outer ring (`ring-4 ring-cyan-100 shadow-md scale-105`).
  - Completed step circles filled with Emerald background and checkmark icon (`Check`).

---

## 3. Current Completion Status (Handover Checkpoint)

### 🟢 Completed Modules & Workflows
1. **WebSidebar & Full Canvas Viewport**:
   - Removed top header bar, top create event button, and header search.
   - Main content viewport expanded to full canvas height.
   - Added pulsing amber notification dot on the user profile avatar trigger at sidebar bottom.
2. **Organizer Dashboard (`Organizerdashboard.jsx`)**:
   - Retired old orange welcome landing page. `/OrganizerHome` loads `Organizerdashboard.jsx` directly.
   - Contains 4 Executive KPI Stat Cards + Rich Events Table.
3. **Profile Page & Operational Action Items (`Profile.jsx`)**:
   - Relocated 4 Operational Action Cards (*Account KYC Status*, *VIP Ticket Alert*, *Gate Scanner Staffing*, *Food Passes*) onto the Profile page with an action badge (`● 1 Action Pending`).
4. **Exhibitor Directory (`Exhibitor.jsx`)**:
   - Updated with 3 KPI metric cards, Shadcn UI table styling, and fallback demo dataset.
5. **Create Event Wizard (`CreateEvent.jsx` & Steps)**:
   - Removed fixed floating bottom bar and Live Card Preview drawer.
   - Upgraded stepper to visual Progress Tracker with connecting track line.
   - Compacted `Step1EventDetails` date/time pickers into a 4-column horizontal row to eliminate vertical scrolling.
6. **Production Build Verification**:
   - Ran `npm run build` — **100% SUCCESS in 5.86s with 0 errors**.

---

## 4. Category & Subcategory Management
- **Admin Panel Control**: Super Users / Admins manage Main Categories and Subcategories from the Admin Panel.
- **Excel Bulk Import**: Support uploading Excel (`.xlsx` / `.csv`) files to bulk import Categories and Subcategories.
- **Organizer Event Creation**: Organizers select Main Category and Subcategory in Step 1.

---

## 5. Rapid Testing & Excel Auto-Fill for Event Creation
- **Auto-Fill Utility**: Provide `⚡ Auto-Fill Demo Event` button and `Upload Excel` tool in `CreateEvent.jsx` for 1-click test populating.

---

## 6. Organizer Onboarding & KYC Rules
- **3-Step Onboarding Architecture**: Step 1 Representative Contact & Email OTP → Step 2 Business Legal GST/PAN → Step 3 Payout Bank Account.

---

## 7. Universal Device Responsiveness
- All layouts, headers, sidebars, grids, forms, and data tables must seamlessly adapt to all screen sizes (Desktops, Laptops, Tablets, Mobile Devices) without horizontal scroll clipping or element overlap.

<!-- Email: bookmyevent2026@gmail.com
Password: admin@#$123 -->