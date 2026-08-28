# 🎪 Comprehensive Event Creation Testing Guide & Sample Test Data

This guide provides step-by-step instructions and complete test data to quickly test the 5-Step Event Creation Wizard in the BookMyEvent application.

---

## ⚡ Quick Testing Tip: 1-Click Auto-Fill
At the top-right of the **Create New Event** page header toolbar, click the **`⚡ Auto-Fill Demo Event`** button. This automatically populates all 5 steps with valid test data so you can test the end-to-end event submission flow instantly!

---

## 📝 Step-by-Step Manual Filling Guide & Sample Test Data

### 🟢 Step 1: Event Identity (Basic Details & Venue)
**Purpose:** Defines the core metadata of the event, dates, categories, location, and delegate types.

| Form Field | Recommended Sample Value | Explanation |
| :--- | :--- | :--- |
| **Main Category** | `Music & Concerts` | High-level event category selected from Admin Panel categories. |
| **Sub Category** | `Live Orchestra & EDM` | Specific subcategory under the main category. |
| **Event Name / Title** | `MRC Grand Music & Cultural Fest 2026` | Public title displayed on ticket portals. |
| **Event Code / ID** | `EVT-2026-MRC` | Unique identifier for tracking and gate scanning. |
| **Start Date & Time** | `2026-09-15` \| `06:00 PM` | Event launch timestamp. |
| **End Date & Time** | `2026-09-15` \| `11:00 PM` | Event conclusion timestamp. |
| **Venue Name & City** | `MRC Center Auditorium`, `Chennai` | Primary venue location. |
| **Full Address** | `100 Santhome High Road, MRC Nagar, Raja Annamalaipuram, Chennai, Tamil Nadu 600028` | Google Maps searchable venue address. |
| **International Delegates** | `Disabled (OFF)` | Controls whether prices are billed in INR (₹) or dual currency. |

---

### 🟢 Step 2: Tickets & Pricing (Free vs. Paid Pass Config)
**Purpose:** Sets pass type (Free Entry Pass vs. Paid Ticket Pass), total seat capacity, price per ticket, GST applicability, and refund policy terms.

| Form Field | Recommended Sample Value | Explanation |
| :--- | :--- | :--- |
| **Pass Type** | `Paid Ticket Pass` | Selects between Free Pass (₹0) and Paid Pass (₹). |
| **Total Seat Capacity** | `500` | Maximum available tickets across all tiers. |
| **Max Passes per User** | `4` | Maximum quantity a single attendee account can purchase. |
| **RSVP Approval Mode** | `Automatic Approval` | Defines whether ticket requests need manual organizer approval. |
| **Ticket Price (₹)** | `₹499` | Base ticket price per delegate in Rupees. |
| **Include GST Tax** | `Enabled (18% GST)` | Calculates tax automatically during checkout. |
| **Refund Terms** | `Full refund up to 48 Hours before event` | Policy displayed on attendee invoice receipts. |

---

### 🟢 Step 3: Facilities & Layout (Stalls, Vehicle & Food Provisions)
**Purpose:** Configures physical exhibitor stall layouts, venue amenities, food voucher add-ons, vehicle passes, and compliance document uploads.

#### 1. Exhibitor Stall Layout (Optional)
* **Stall Name:** `A1 - Premium Tech Booth`
* **Stall Dimensions:** `10x10 sqft`
* **Stall Type:** `Paid` (`₹5,000`)
* **Visibility:** `Public`

#### 2. Food Provisions (Food Vouchers / Pass Add-Ons)
* **Coupon Type:** `VIP Lunch Buffet Pass`
* **Rate:** `₹350`
* **Pass Count:** `100 Passes`

#### 3. Vehicle & Parking Allotment (Scroll Area Enabled)
* **2-Wheeler Pass Rate:** `₹50`
* **4-Wheeler Pass Rate:** `₹150`
* **Heavy Vehicle Pass Rate:** `₹300`
* **Parking Add-On:** `VIP Valet Parking` (`₹250`)

---

### 🟢 Step 4: Partners & Sponsors (Vendors, Sponsors & Chief Guests)
**Purpose:** Add participating vendors, corporate event sponsors, and VIP speakers or chief guests.

#### 1. Event Sponsors
* **Sponsor Name:** `TechCorp Global`
* **Sponsorship Level:** `Title Sponsor`
* **Contribution Amount:** `₹1,50,000`

#### 2. Keynote Speakers / Chief Guests
* **Guest Name:** `Dr. A. Subramanian`
* **Designation:** `Minister of Cultural Affairs`
* **Topic:** `Keynote Address on Cultural Revival`

---

### 🟢 Step 5: Terms & Policies (Rules & Regulations)
**Purpose:** Attach legal terms, cancellation guidelines, paper submission rules, and safety policies.

| Form Field | Recommended Sample Value | Explanation |
| :--- | :--- | :--- |
| **Policy Group** | `Cancellation Policy` | High-level policy group. |
| **Policy Type** | `General Cancellation` | Category under policy group. |
| **Policy Name** | `Standard 48-Hour Cancellation` | Specific policy title. |
| **Set as Default** | `Checked (Yes)` | Applies this policy to all ticket purchases by default. |

---

## 🚀 How to Execute & Verify Event Submission

1. Navigate to `/OrganizerHome/CreateEvent` on the organizer dashboard.
2. Either click `⚡ Auto-Fill Demo Event` or manually enter the sample data above.
3. Use the **Top Navigation Bar** (`Next Step >`) to move between steps.
4. On Step 5, click **`Publish Event`**.
5. You will see a success notification: **`Event published successfully!`**.
6. Navigate back to the **Organizer Dashboard** (`/OrganizerHome/Organizerdashboard`); your created event will appear in the Executive KPI table!
