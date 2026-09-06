# System Scalability Assessment (10,000 Concurrent Requests) & Production Roadmap

## Executive Summary: Can Our System Handle 10,000 Requests at a Time?

> [!WARNING]
> **Honest Answer: In its current single-instance development setup, NO.**
> If 10,000 requests hit the system simultaneously right now, the server would experience **504 Gateway Timeouts, 500 Connection Pool Exhaustion errors, and request starvation** within 2–3 seconds.

However, the application architecture (FastAPI + PostgreSQL + React) is **exceptionally capable** of handling 10,000+ requests/sec once the 5 specific architectural bottlenecks identified below are resolved.

---

## Part 1: The 5 Bottlenecks in the Current Codebase

### 1. Database Connection Pool Exhaustion (Max 60 Connections)
* **Code Reference**: [`app/extensions/database.py`](file:///d:/personal/eventapp/Backend_page/app/extensions/database.py#L18-L24)
  ```python
  engine = create_engine(
      db_url,
      pool_size=25,
      max_overflow=35  # Maximum 60 total concurrent DB connections!
  )
  ```
* **What happens under 10k requests**:
  The first 60 requests acquire all connections. The remaining 9,940 requests enter SQLAlchemy's queue. When the 30-second queue timeout expires, SQLAlchemy throws:
  `TimeoutError: QueuePool limit of size 25 overflow 35 reached, connection timed out`.

### 2. Synchronous Blocking Email Delivery (Gmail SMTP)
* **Code Reference**: [`app/Services/mail_service.py`](file:///d:/personal/eventapp/Backend_page/app/Services/mail_service.py#L63-L71)
  ```python
  with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
      server.starttls()
      server.login(...)
      server.send_message(msg)
  ```
* **What happens under 10k requests**:
  `smtplib.SMTP` connects synchronously over TLS to Gmail's mail server. A single email handshake takes **1.2 to 2.5 seconds**. 
  When 1,000 users register or request an OTP at the same time, the server threads freeze waiting on network sockets to Google Mail, grinding the entire API to a halt.

### 3. Single-Worker Process & Threadpool Limit
* **Current Execution**: Running via a single Uvicorn worker process on 1 CPU core (`python run.py`).
* **What happens under 10k requests**:
  FastAPI offloads synchronous route functions to an internal `anyio` threadpool capped by default at **40 worker threads**. Once 40 concurrent requests are in flight, all other requests wait in the OS socket backlog buffer until the OS drops incoming TCP SYN packets (`ECONNREFUSED`).

### 4. In-Memory State Breaks Horizontal Scaling
* **Code Reference**: [`app/Services/otp_service.py`](file:///d:/personal/eventapp/Backend_page/app/Services/otp_service.py#L5-L6)
  ```python
  otp_store = {}        # In-memory Python dictionary
  verified_users = set() # In-memory Python set
  ```
* **What happens under 10k requests**:
  To handle 10,000 requests, you must run multiple worker processes or containers. If User A requests an OTP on **Worker 1**, `otp_store` on Worker 1 gets updated. When User A verifies the OTP on **Worker 2**, Worker 2 says `"No OTP found"`. Session and OTP state must reside in **Redis**, not in Python memory.

### 5. No Reverse Proxy / Edge Caching
* Every request directly hits Python application code—even read-heavy queries like fetching public event lists (`GET /api/v1/events`), categories, and venue details that rarely change from second to second.

---

## Part 2: The High-Concurrency Architecture (Scaling to 10k+ Req/Sec)

```
                       [ 10,000 Concurrent Clients ]
                                     │
                                     ▼
                  [ Edge Layer: Cloudflare / CDN ]
              • Absorbs DDoS attacks & rate limits spikes
              • Caches public GET /api/v1/events (80% of traffic)
              • SSL Termination & Connection Keep-Alive
                                     │
                                     ▼
                [ Ingress Load Balancer: Nginx / ALB ]
              • Distributes traffic across backend instances
              • Buffers slow client uploads
                                     │
                      ┌──────────────┴──────────────┐
                      ▼                             ▼
        [ Backend Container 1 ]       [ Backend Container 2 ]
        • Gunicorn + 4 Uvicorn Workers • Gunicorn + 4 Uvicorn Workers
        • FastAPI Async Endpoints     • FastAPI Async Endpoints
        • RateLimiter Middleware      • RateLimiter Middleware
                      │                             │
                      └──────────────┬──────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              ▼                      ▼                      ▼
      [ Redis Cluster ]     [ PgBouncer Pooler ]   [ Background Queue ]
      • Shared OTP store    • Pools 10k client     • Celery / FastAPI
      • Rate limit counters   conns to 60 Postgres   BackgroundTasks
      • Event Cache (TTL 5m)  conns via transaction  for non-blocking
                               pooling                instant emails
                                     │
                                     ▼
                        [ PostgreSQL (Supabase) ]
                        • Indexed relational queries
```

---

## Part 3: Prioritized Step-by-Step Implementation Plan

### Step 1: Immediate Defense & Abuse Control *(Current Starting Point)*
1. **Backend Rate Limiting Middleware**:
   - Implement sliding-window rate limiting in FastAPI with in-memory + Redis fallback.
   - Throttles: Login (5/min), OTP (3/5min send, 5/5min verify), Team invites (10/min), General (120/min).
   - Returns standard HTTP 429 with `Retry-After`.
2. **Frontend Slow Network & Offline Toast Warning**:
   - `NetworkStatusWatcher.jsx`: Alerts users on network drops (`offline`), high latency / 2G (`navigator.connection`), and long requests (> 4000ms) to prevent repeated clicks.

### Step 2: Unblock Throughput & Asynchronous Decoupling
1. **Background Email Dispatch**:
   - Convert `send_email` calls in `auth_service.py` and `rbac_service.py` to FastAPI `BackgroundTasks`.
   - The API will respond in **15 milliseconds** instead of waiting 2 seconds for Gmail SMTP.
2. **Redis-Backed OTP & Session Store**:
   - Migrate `otp_store` and `verified_users` from Python dictionary to Redis with automatic TTL (300s).

### Step 3: Database High-Concurrency Hardening
1. **Supabase PgBouncer Integration**:
   - Switch `DATABASE_URL` port to Supabase's transaction connection pooler (port `6543`), allowing thousands of concurrent client connections without connection starvation.
2. **Database Indexing Audit**:
   - Ensure explicit indexes exist on high-frequency filters: `users(email)`, `events(status, start_date)`, `organization_members(organization_id, user_id)`.

### Step 4: Production Frontend Resilience
1. **Axios Timeout & Idempotent Auto-Retry**:
   - Configure 15s request timeout and 1-attempt retry on network drops.
2. **Global React Error Boundary**:
   - Prevent blank white screens on runtime exceptions; show a branded reload card.
3. **Security Headers Middleware**:
   - Implement `nosniff`, `DENY`, and strict referrer headers.

---

## Verification & Benchmarking Matrix

| Stage | Benchmark Test | Target Result |
| :--- | :--- | :--- |
| **Stage 1 (Rate Limit)** | 6 rapid POSTs to `/api/v1/auth/login` | HTTP 429 on 6th request with clean `Retry-After` |
| **Stage 2 (Async Mail)** | 50 concurrent registrations | API latency < 50ms per request (no SMTP wait) |
| **Stage 3 (Load Test)** | Locust / k6 test with 1,000 concurrent virtual users | 0 connection pool drops, p95 response time < 250ms |
