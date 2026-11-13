# Edu Predict

**Edu Predict** is a full-stack academic performance companion and student management web application powered by a **Python (`app.py`) backend**, **SQLite** database, and a **React + TypeScript + Tailwind CSS** frontend.

---

## Key Features

- **Student Portal & Bio-Data Profiles**
  - Editable student profile & bio-data (name, SRN, semester, department, gender-specific portraits, contact info, CGPA, daily study hours, and backlogs).
  - Real-time clock, live notification center, and light/dark mode toggle.
- **Attendance Ledger & 75% Eligibility Safeguard**
  - Subject-wise **Present** and **Absent** counters, aggregate attendance tracking, safe-cushion/remedial hours calculator, and persistent daily attendance logging.
- **Subject Tracker & Continuous Internal Assessment (`/50`)**
  - Add new courses (`+`) or remove courses dynamically, update internal marks out of `50`, and inspect completion bars.
- **Weekly Timetable Planner**
  - Day-by-day Monday–Friday lecture schedule with quick `+` slot additions and room/faculty assignments.
- **Daily Tasks, To-Do Tracker & Study Milestones**
  - Add, toggle, and delete daily study tasks alongside short-term milestone rings for personal progress tracking.
- **Projects, Certifications & Live Study Tests**
  - Track portfolio projects and certifications, take interactive timed mock tests, and generate personalized AI revision tests synced to enrolled courses.
- **Performance Insights, Digital Student Twin & Cohort Clustering**
  - Live semester score & CGPA estimator, feature impact attribution, interactive "What-If" Digital Student Twin simulator, and multi-feature K-Means student clustering.
- **Voice & Academic Advisor**
  - Interactive academic guidance chat with optional speech synthesis and Gemini API integration (`GEMINI_API_KEY`).
- **Faculty & Admin Consoles**
  - Class performance summary, high-risk roster filtering, CSV export, model retraining triggers, and audit logs.

---

## Architecture & Tech Stack

| Layer | Technology | Files |
| :--- | :--- | :--- |
| **Main Server & CLI** | Python 3.10+ (`ThreadingHTTPServer`) | `app.py`, `python_app/server.py` |
| **Database** | SQLite 3 (`data/learningmate.db`) | `python_app/database.py` |
| **Analytics & Clustering** | Pure-Python ensemble regression, logistic pass probability, Digital Twin & K-Means | `python_app/ml_engine.py` |
| **Academic Advisor AI** | Gemini 2.5 Flash REST client (`urllib.request`) + contextual fallback | `python_app/ai_advisor.py` |
| **Frontend UI** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons | `src/` |
| **Dev Proxy Gateway** | Express + Vite middleware forwarding `/api/*` to Python | `server.ts` |

---

## Prerequisites

- **Python 3.10+** (`python` / `python3`) — Uses only Python Standard Library modules (`http.server`, `sqlite3`, `urllib.request`, `json`, `math`, `unittest`), so **no `pip` packages are required**.
- **Node.js 18+ & npm** — Needed to install frontend packages and build the React bundle into `dist/`.

---

## Quick Start (Run with `python app.py`)

1. **Install frontend dependencies & build the UI bundle:**
   ```bash
   npm install
   npm run build
   ```
   *(If `dist/` is missing and `node_modules/` exists, `python app.py` will automatically run `npm run build` on startup.)*

2. **Start the entire application with Python:**
   ```bash
   python app.py
   ```
   *(On Linux/macOS systems where Python 3 is invoked as `python3`, run `python3 app.py`.)*

3. Open **`http://localhost:3000`** in your browser. Both the frontend SPA and all `/api/*` endpoints are served directly by Python.

### Optional CLI Flags & Environment Variables

```bash
python app.py --host 0.0.0.0 --port 3000   # Custom host/port (defaults to 0.0.0.0:$PORT or 3000)
python app.py --build                      # Force rebuild dist/ before starting the Python server
python app.py --no-build                   # Start without checking/building dist/
python app.py --db ./data/custom.db        # Use a custom SQLite database file path
```

Optional `.env` configuration (copy from `.env.example`):

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
PORT="3000"
```

---

## Development Mode (Vite HMR + Python Backend)

To run live Vite development middleware alongside the Python backend:

```bash
npm run dev
```

This starts the Python server on `127.0.0.1:5050` and mounts Vite on `http://localhost:3000`, proxying all `/api/*` requests directly to Python.

---

## Running Tests & Typechecks

```bash
# Python backend, ML engine, and live HTTP + SQLite integration tests
python3 -m unittest -v tests/test_python_backend.py

# Frontend TypeScript check
npm run lint

# Production bundle build
npm run build
```

---

## Core Python REST API Endpoints

- `GET /api/health` — Runtime status, database engine, and enrolled student count
- `POST /api/auth/login`, `POST /api/auth/register` — Role-aware authentication (`student`, `teacher`, `admin`)
- `GET /api/students`, `GET /api/students/:id` — Query cohort & student profiles
- `PUT /api/students/:id/profile` — Update student bio-data & portrait selection
- `POST /api/students/:id/attendance` — Log `present` / `absent` session counts in SQLite
- `PUT /api/students/:id/internals`, `POST /api/students/:id/subjects`, `DELETE /api/students/:id/subjects/:code` — Manage courses & `/50` internal assessment marks
- `GET /api/timetable`, `POST /api/timetable`, `DELETE /api/timetable/:id` — Weekly timetable CRUD
- `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id/toggle`, `DELETE /api/tasks/:id` — Daily tasks checklist
- `GET /api/live-tests`, `POST /api/live-tests/generate`, `POST /api/live-tests/:id/submit` — Study quizzes & scoring
- `GET /api/projects`, `POST /api/projects`, `GET /api/certifications`, `POST /api/certifications` — Portfolio & badges
- `POST /api/predict`, `POST /api/digital-twin/simulate`, `GET /api/clusters` — Performance projections, simulations & K-Means cohorts
- `POST /api/ai-chat` — Academic Advisor Q&A
- `GET /api/model-metrics`, `POST /api/models/retrain`, `GET /api/system-logs` — Admin diagnostics & retraining
