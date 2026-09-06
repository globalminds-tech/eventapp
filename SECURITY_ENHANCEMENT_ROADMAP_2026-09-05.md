# Production Security Enhancement Roadmap
**Date Created:** September 5, 2026  
**Project:** BookMyEvent Web Application  
**Target Audience:** Public / Common Users (Event Attendees, Organizers, Exhibitors, Vendors, Admins)

---

## Executive Summary

The application has successfully completed Phase 1 and Phase 2 scalability and defense hardening:
- **FastAPI Sliding Window Rate Limiting** (`rate_limit.py`) protecting sensitive endpoints against brute-force and DDoS.
- **Enterprise HTTP Security Headers** (`security_headers.py`) preventing clickjacking, MIME sniffing, and cross-origin leakage.
- **Asynchronous Non-Blocking Email Dispatch** (`mail_service.py`) reducing API latency from ~2s to 0.62ms.
- **Redis-Backed Distributed OTP Cache** (`otp_service.py`) supporting horizontal scaling with graceful in-memory fallback.
- **Frontend Real-time Network Latency Watcher & Auto-Retry** (`NetworkStatusWatcher.jsx` + `axiosClient.js`).
- **Multi-Tab Logout Synchronization** (`AuthInitializer.jsx`).

This document records the **5 next-priority security enhancements** designed specifically for public-facing production deployments with common users.

---

## The 5 Priority Security Enhancements

### 1. File Upload Hardening & Stored XSS Prevention
* **Risk Context**: Users and organizers upload profile pictures, event banners, exhibitor brochures, and KYC identification documents (PAN, GST, Aadhaar).
* **Vulnerabilities**:
  - Uploading executable scripts (`.php`, `.py`, `.sh`, `.exe`, `.html`) disguised as images.
  - Uploading malicious `.svg` files containing embedded `<script>` or `<foreignObject>` tags that execute JavaScript in victim browsers when viewed (Stored XSS).
  - Unbounded file sizes (decompression / size bombs) exhausting server disk storage or memory.
  - Path traversal exploits (`../../filename.jpg`) escaping the target directory.
* **Target Files**:
  - [`Backend_page/app/extensions/storage.py`](file:///d:/personal/eventapp/Backend_page/app/extensions/storage.py)
  - [`Backend_page/app/modules/organizer/routes/organizer_routes.py`](file:///d:/personal/eventapp/Backend_page/app/modules/organizer/routes/organizer_routes.py)
  - [`Backend_page/app/modules/users/routes/user_routes.py`](file:///d:/personal/eventapp/Backend_page/app/modules/users/routes/user_routes.py)
* **Implementation Blueprint**:
  1. **Strict Extension Whitelist**:
     - Image uploads: `.jpg`, `.jpeg`, `.png`, `.webp` only (reject or sanitize `.svg`).
     - Document uploads: `.pdf` only.
  2. **File Size Enforcement**:
     - Max 5MB for profile avatars, logos, and event banners.
     - Max 10MB for KYC documents.
     - Reject oversized payloads with HTTP 413 (Payload Too Large).
  3. **Path & Filename Sanitization**:
     - Enforce UUID generation for all stored files (`uuid.uuid4().hex + ext`), completely discarding raw client-provided filenames.
  4. **Magic Byte Verification**:
     - Validate binary file headers (e.g., using `python-magic` or file header signatures) rather than trusting client-sent `Content-Type`.

---

### 2. Account-Level Lockout Policy (Defense Against Distributed Botnets)
* **Risk Context**: IP-based rate limiting (5 req/min) protects against rapid attacks from a single computer or IP. However, attackers using distributed proxy networks (botnets/VPNs) can test thousands of passwords against a specific organizer or admin account (`admin@...`) using different IP addresses for each attempt.
* **Vulnerability**: Target account remains vulnerable to distributed brute-force and credential stuffing.
* **Target Files**:
  - [`Backend_page/app/modules/auth/services/auth_service.py`](file:///d:/personal/eventapp/Backend_page/app/modules/auth/services/auth_service.py)
  - [`Backend_page/app/extensions/redis.py`](file:///d:/personal/eventapp/Backend_page/app/extensions/redis.py)
* **Implementation Blueprint**:
  1. **Failed Attempt Tracker**:
     - On incorrect password entry in `login_user()`, increment `failed_login:{email}` in Redis (or in-memory cache) with a 15-minute TTL.
  2. **Temporary Account Lock**:
     - If `failed_login:{email} >= 5`:
       - Reject login immediately with HTTP 423 (Locked) or HTTP 403:
         ```json
         {
           "success": false,
           "detail": "This account has been temporarily locked due to 5 consecutive failed login attempts. Please try again in 15 minutes or reset your password.",
           "locked": true,
           "lock_duration_minutes": 15
         }
         ```
  3. **Counter Reset**:
     - Upon entering the correct password, delete `failed_login:{email}` immediately.

---

### 3. Password Strength Enforcement
* **Risk Context**: General public users often register with weak passwords (`123456`, `qwerty`, `password`) that are easily guessed from common dictionary leaks.
* **Vulnerability**: The registration endpoint currently accepts single-character passwords with no length or complexity validation.
* **Target Files**:
  - [`Backend_page/app/modules/auth/services/auth_service.py`](file:///d:/personal/eventapp/Backend_page/app/modules/auth/services/auth_service.py)
  - [`Backend_page/app/modules/auth/schemas/auth_schema.py`](file:///d:/personal/eventapp/Backend_page/app/modules/auth/schemas/auth_schema.py)
  - [`Frontend_page/src/features/auth/pages/RegisterPage.jsx`](file:///d:/personal/eventapp/Frontend_page/src/features/auth/pages/RegisterPage.jsx)
* **Implementation Blueprint**:
  1. **Backend Validation**:
     - Minimum 8 characters, maximum 128 characters.
     - Must include at least one letter and at least one number.
     - Reject passwords containing the user's email prefix.
  2. **Frontend Visual Feedback**:
     - Live password strength indicator (Weak, Medium, Strong) with visual criteria checklist on registration and reset password screens.

---

### 4. Input Sanitization & Stored XSS Defense in Event Content
* **Risk Context**: Event organizers write Event Titles, Descriptions, Terms & Conditions, and Venue Guides. Users submit Complaints and Feedback.
* **Vulnerability**: If an organizer embeds `<script>` or `<img src=x onerror="...">` in an event description, any attendee visiting `/event-detail/:id` could execute that script within their authenticated browser session.
* **Target Files**:
  - [`Backend_page/app/modules/organizer/services/organizer_service.py`](file:///d:/personal/eventapp/Backend_page/app/modules/organizer/services/organizer_service.py)
  - [`Backend_page/app/modules/events/services/event_service.py`](file:///d:/personal/eventapp/Backend_page/app/modules/events/services/event_service.py)
* **Implementation Blueprint**:
  1. **Backend Sanitization**:
     - Use a lightweight sanitization utility (or `bleach` / HTML entity escaping) to strip executable tags (`<script>`, `<iframe>`, `<object>`, `<embed>`, `onload=`, `onerror=`) before persisting rich text descriptions to PostgreSQL.
  2. **Frontend Safe Rendering**:
     - Avoid raw `dangerouslySetInnerHTML` on unvetted user text; use clean text rendering or sanitized DOM parsers.

---

### 5. Production Error Sanitization (Zero Traceback Leakage)
* **Risk Context**: When unexpected database exceptions, connection timeouts, or unhandled 500 errors occur in production.
* **Vulnerability**: Raw exception strings can leak database table names, SQL query structure, server file paths, and dependency versions.
* **Target Files**:
  - [`Backend_page/app/exceptions/handlers.py`](file:///d:/personal/eventapp/Backend_page/app/exceptions/handlers.py)
* **Implementation Blueprint**:
  1. **Environment Check**:
     - When `ENV == "production"`, catch unhandled exceptions and return:
       ```json
       {
         "success": false,
         "detail": "An internal server error occurred. Please try again later.",
         "request_id": "req-uuid-here"
       }
       ```
  2. **Secure Server Logging**:
     - Log full stack traces and technical details to backend server logs / log files with unique request IDs for developer diagnosis, keeping all internal details hidden from the client.

---

## Action Plan & Verification Strategy

| Phase | Enhancement | Target Benchmark |
| :--- | :--- | :--- |
| **Step 1** | **File Upload Hardening** | Uploading `.sh` or a 15MB file returns clean HTTP 400/413 rejection; all stored files are assigned UUID names. |
| **Step 2** | **Account Lockout Policy** | 5 consecutive wrong passwords for `user@example.com` locks account for 15 min across all IP addresses. |
| **Step 3** | **Password Strength Validation** | Submitting password `< 8` chars returns HTTP 422 with actionable guidance. |
| **Step 4** | **Input Sanitization** | Descriptions with `<script>` tags have malicious tags stripped prior to database write. |
| **Step 5** | **Production Error Sanitization** | 500 errors return structured, opaque responses with no Python stack traces or DB details exposed. |

---

*This document serves as the official specification for the next security sprint.*
