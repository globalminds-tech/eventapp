# 📘 Complete Low-Level Guide: BookMyEvent Bank Payouts & Razorpay Automated Transfer Architecture

> **Purpose:** This document provides a detailed, simple, low-level explanation of how our current event platform handles organizer bank details and how automated money transfers work using Razorpay.

---

## 1. Current System Architecture (What We Built)

Our application has a **3-Step Onboarding Architecture** for Organizers and Exhibitors:

```
[ Step 1: Contact ] ➔ [ Step 2: Legal GST/PAN ] ➔ [ Step 3: Bank Payout Setup ]
```

### 🗄️ Database Storage Schema

When an Organizer completes **Step 3**, the details are saved in the PostgreSQL / SQLite database under two connected tables:

1. **`users` Table:**
   - `id`: Unique user ID
   - `name`: Representative name
   - `email`: Official email
   - `role`: `"organizer"` or `"exhibitor"`

2. **`organizer_profiles` / `exhibitor_profiles` Table:**
   - `user_id`: Foreign Key pointing to `users.id`
   - `company_name`: Business / Company name
   - `gstin`: GSTIN Tax identification
   - `pan_number`: PAN card number
   - `bank_name`: Bank Name (e.g., HDFC Bank)
   - `account_number`: Bank Account Number (e.g., `50100028912345`)
   - `ifsc_code`: IFSC Code (e.g., `HDFC0000240`)
   - `account_holder`: Account Holder Name (e.g., `Ashok Babu P`)
   - `upi_id`: Virtual Payment Address (e.g., `ashok@icici`)
   - `kyc_status`: `"VERIFIED"`

---

## 2. Understanding Payment Flow vs. Payout Flow

To understand money transfers, we split the flow into two separate parts:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PART 1: PAYMENT                                      │
│                                                                                        │
│  [ Ticket Buyer ] ────(Pays ₹1,000 via UPI/Card)────► [ Platform Razorpay Account ]   │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PART 2: PAYOUT                                       │
│                                                                                        │
│  [ Platform Razorpay ] ────(Transfers ₹950 Payout)───► [ Organizer's Personal Bank ]   │
│                        ────(Retains ₹50 Fee)─────► [ Platform Revenue Wallet ] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Low-Level Step-by-Step Sequence

### Step A: Collecting Bank Details (Step 3 Form)
* The organizer enters their Bank Account Number (`50100028912345`) and IFSC Code (`HDFC0000240`) into Step 3 of our React web application.
* React sends a `POST /api/v1/auth/register/organizer` request to the FastAPI backend.
* FastAPI validates the payload and saves the raw bank details safely into the database table `organizer_profiles`.

---

### Step B: Creating Razorpay Linked Account (Behind the Scenes)
* **Question:** *Does the organizer need to create a Razorpay account?*
* **Answer:** **No.** The organizer never visits Razorpay.
* **Low-Level Code Action:**
  When FastAPI saves the bank details, our Python backend sends a background HTTP POST request to Razorpay using **YOUR** platform API Key:

  ```http
  POST https://api.razorpay.com/v1/accounts
  Authorization: Basic [YOUR_RAZORPAY_KEY:YOUR_SECRET]
  Content-Type: application/json

  {
    "email": "pashokbabu.38@gmail.com",
    "phone": "7010085577",
    "type": "route",
    "legal_business_name": "Ashok Global Events",
    "profile": {
      "category": "events",
      "addresses": {
        "operation": {
          "street1": "123 Event Street",
          "city": "Chennai",
          "state": "TN",
          "postal_code": "600001",
          "country": "IN"
        }
      }
    },
    "bank_account": {
      "ifsc_code": "HDFC0000240",
      "account_number": "50100028912345",
      "name": "Ashok Babu P"
    }
  }
  ```

* **Result:** Razorpay returns a linked account identifier (e.g. `acc_L1k9xX7zQ9`). Our backend saves `razorpay_account_id = "acc_L1k9xX7zQ9"` inside `organizer_profiles`.

---

### Step C: Automated Instant Money Split (Ticket Purchase)

When an attendee buys an event ticket worth **₹1,000**:

1. **Frontend Request:** Attendee clicks "Pay Now".
2. **Backend Order Creation:**
   FastAPI calculates:
   - Total Ticket Price: **₹1,000**
   - Platform Commission (5%): **₹50**
   - Organizer Share (95%): **₹950**

   Backend creates a Razorpay Order with transfer instructions:

   ```json
   {
     "amount": 100000,
     "currency": "INR",
     "transfers": [
       {
         "account": "acc_L1k9xX7zQ9",
         "amount": 95000,
         "currency": "INR",
         "on_hold": 0
       }
     ]
   }
   ```

3. **Payment Completion:** Attendee enters UPI PIN or OTP and pays ₹1,000.

---

### Step D: Direct Bank Settlement

* **Razorpay automatically routes ₹950** into `acc_L1k9xX7zQ9` (Ashok's HDFC Bank Account).
* **Razorpay routes ₹50** into BookMyEvent's platform bank account.
* The money is deposited into the organizer's actual bank account via IMPS/NEFT without any manual intervention!

---

## 4. Summary Matrix: Why This Design Works Best

| Requirement | How We Solve It |
| :--- | :--- |
| **Do organizers need Razorpay?** | **No.** Organizers only provide normal bank details (Account No + IFSC). |
| **Is money secure?** | Yes, encrypted in DB and processed via Razorpay Route API. |
| **Does updating bank details recreate the user?** | **No.** The system checks `user_id` and performs an `UPDATE` on existing DB rows. |
| **Can organizers edit bank details later?** | **Yes.** Organizers can click "Update Bank Setup" in `Profile.jsx` anytime. |

---

## 5. Python / FastAPI Implementation Reference

```python
# Backend logic snippet for updating bank details & linked account
def update_bank_payout_details(user_id: int, bank_data: dict):
    # 1. Fetch existing profile from DB
    profile = db.session.scalar(select(OrganizerProfile).where(OrganizerProfile.user_id == user_id))
    
    # 2. Update Bank fields
    profile.bank_name = bank_data.get("bank_name")
    profile.account_number = bank_data.get("account_number")
    profile.ifsc_code = bank_data.get("ifsc_code")
    profile.account_holder = bank_data.get("account_holder")
    profile.upi_id = bank_data.get("upi_id")
    
    db.session.commit()
    return {"status": "success", "message": "Bank details updated"}
```
