# Gig-Sentry

> Financial identity for the gig economy.

Gig-Sentry tracks the daily income, trips, and ratings of gig workers on platforms like **Swiggy, Blinkit, Uber, Ola, and Rapido** to generate a **Gig Score** (0–1000) — a creditworthiness metric that unlocks access to **loans and insurance** without a salary slip or formal employment history.

---

## The Problem

India has 15M+ gig workers. They earn daily, not monthly. Banks won't give them loans or insurance because they have no payslips, no formal employment history, and no credit score that reflects their real income.

Gig-Sentry solves this by being a **financial passport** built on actual work data.

---

## How the Gig Score Works

The score (0–1000) is computed from logged work history using five factors:

| Factor | Max Points | What it measures |
|---|---|---|
| Customer Rating | 250 | Avg rating across all logged days (1–5 stars) |
| Income Consistency | 200 | Low variance in daily earnings — stable income = lower credit risk |
| Earnings Volume | 200 | Average daily earnings relative to ₹2,000 benchmark |
| Trip Activity | 200 | Average trips per day relative to 15-trip benchmark |
| Tracking Tenure | 150 | Number of days with logged data (capped at 30 days) |

### Score → Eligibility

| Score | Label | Risk | Loan Range | Interest | Insurance |
|---|---|---|---|---|---|
| 800–1000 | Excellent | Low | ₹75,000 – ₹1,50,000 | 12% p.a. | Premium — ₹10L cover |
| 650–799 | Good | Medium | ₹25,000 – ₹50,000 | 16% p.a. | Standard — ₹5L cover |
| 450–649 | Fair | Medium | ₹5,000 – ₹10,000 | 22% p.a. | Basic — ₹2L cover |
| 0–449 | Poor | High | Not eligible | — | Not eligible |

---

## Project Structure

```
srm_hackathon-7-04-2026-/
├── frontend/                     React + Vite dashboard (gig worker UI)
│   └── src/
│       ├── pages/                Login, Dashboard
│       └── components/
│           ├── dashboard/        MetricCard, ChartsSection, HistoryTable,
│           │                     AddEntryForm, RideControl, StatusPanel,
│           │                     LoanInsuranceCards
│           └── layout/           Sidebar, TopNavbar
│
├── backend/                      Node.js + Express REST API
│   ├── server.js
│   └── src/
│       ├── services/
│       │   └── scoreEngine.js    ← Gig Score algorithm
│       ├── routes/               auth · history · score · ride
│       ├── controllers/
│       ├── middleware/auth.js    ← JWT verification
│       └── db.js                ← PostgreSQL pool
│
└── database/
    ├── schema.sql                Table definitions + constraints
    └── seed.sql                  14-day demo dataset (Ravi Kumar / Swiggy)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Chart.js, React Router |
| Backend | Node.js, Express.js, JWT |
| Database | PostgreSQL |
| Auth | bcryptjs (passwords) + JSON Web Tokens |

---

## API Reference

All protected routes require `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password, platform }` | Register a gig worker |
| POST | `/api/auth/login` | `{ email, password }` | Login, returns JWT |
| GET | `/api/auth/profile` | — | Profile + current Gig Score |

### Income History
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/history` | Fetch work history (supports `?limit=&offset=`) |
| POST | `/api/history` | Log a new work day — triggers score recalculation |
| DELETE | `/api/history/:id` | Remove an entry |

**POST /api/history body:**
```json
{
  "earnings": 1500,
  "trips": 12,
  "rating": 4.8,
  "weather": "Normal",
  "date": "2026-04-07T18:00:00Z"
}
```

### Gig Score
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/score` | Full score with breakdown + loan & insurance info |
| GET | `/api/score/loan` | Loan eligibility tier and amount range |
| GET | `/api/score/insurance` | Insurance plan details |
| POST | `/api/score/recompute` | Force-recalculate from raw history (90-day window) |

### Ride Sessions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ride/start` | Start a work session |
| POST | `/api/ride/stop` | End the active session |
| GET | `/api/ride/status` | Current session status + live duration |
| GET | `/api/ride/history` | Last 20 sessions |

---

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Database
```bash
psql -U postgres -f database/schema.sql
psql -U postgres -d gig_sentry_db -f database/seed.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET
npm install
npm run dev          # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

---

## Platforms Supported

Swiggy · Blinkit · Uber · Ola · Rapido · Zomato · Porter · Other

---

## Future Scope

- ONDC / Account Aggregator integration to auto-pull earnings data
- Weather API to contextualise low-earning days (rain, heat)
- Bank / NBFC partner portal to receive pre-qualified leads
- AI-based risk prediction (default probability model)
- UPI-linked real-time earnings ingestion

---

## Team

Built at SRM Hackathon — April 7, 2026.
