# Kigali Unified Patient Records & Insurance Network

**A permissioned, interoperable health data platform for clinics, hospitals, pharmacies and insurance providers in Kigali, Rwanda.**

ALU Enterprise Systems Project — BSc. in Software Engineering

---

## What this is

Patient medical records in Kigali are siloed within individual hospitals and clinics. When a patient switches providers, visits a specialist, or needs emergency care, their history does not travel with them. This causes redundant diagnostic testing, drug interaction risks, delayed emergency care, and insurance claim friction.

This platform provides a consent-first, role-based network that lets verified institutions securely share patient records — while keeping the patient in control and all diagnostic authority with licensed medical professionals.

> This is a decision-support system, not a decision-making one. It flags interactions and duplicates. It never prescribes.

---

## Frontend (this repo)

React 19 + Vite 8 + Tailwind CSS v4. Five role-specific dashboards, dark/light mode, simulated RBAC.

| Layer | Choice |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 (Vite plugin) |
| Routing | React Router v7 |
| Icons | Lucide React |
| Fonts | Inter · Fraunces · IBM Plex Mono |

---

## Full system architecture

```
Browser / Frontends
       |
       v
  HAProxy :80           <- single entry point, path-based routing
       |
  records-service :8000        clinical-service :8001
  pharmacy-service :8002       insurance-service :8003
  admin-service :8004          notification-service :8005
       |
  PostgreSQL 16          Redis 7 Pub/Sub
  (per-service schemas)  (async events)
```

### Microservices

| Service | Port | Responsibility |
|---|---|---|
| Records & Consent | 8000 | Profiles, history, consent, audit log |
| Clinical Service | 8001 | Diagnosis, vitals, interaction flags |
| Pharmacy Service | 8002 | Prescription verification, dispensing |
| Insurance Service | 8003 | Coverage checks, claims tracking |
| Admin Service | 8004 | Institutions, API tokens, audit |
| Notification Service | 8005 | Redis subscriber — SMS/email alerts |

### Event flow (prescription creation)

```
Doctor submits  ->  Clinical Service (REST POST)
Validate consent  ->  Records Service (REST GET)
Write & publish  ->  Redis: prescription_created
  |-- Pharmacy (async)   -> interaction/duplicate check
  |-- Insurance (async)  -> coverage pre-validation
  +-- Notification (async) -> SMS/email to patient + pharmacy
```

Steps 3-5 run concurrently. No service blocks on another.

---

## Dashboards

| Role | Route | What they can do |
|---|---|---|
| Patient | `/patient` | View records, manage consent, audit log |
| Doctor | `/clinic` | Patient list, consent-gated history, prescriptions |
| Nurse | `/clinic` | Vitals entry, limited history view |
| Pharmacist | `/pharmacy` | Prescription queue, flags, dispense |
| Insurance Agent | `/insurance` | Claims queue, approve/reject/pay |
| Platform Admin | `/admin` | Institutions, API tokens, health, audit |

---

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+

### Install and run

```bash
git clone https://github.com/your-org/kigali-health-network.git
cd kigali-health-network
npm install
cp .env.example .env
npm run dev
# -> http://localhost:5173
```

Select any role on the login screen. No credentials needed in prototype mode.

### Build for production

```bash
npm run build
# Output: dist/ — serve with Nginx, Vercel, Netlify, etc.
```

### Connect to the live backend

1. Set `VITE_API_BASE_URL=http://your-server/api` in `.env`
2. In `src/data/api.js` uncomment the `apiFetch()` calls and delete the mock returns
3. `npm run build` and deploy `dist/`

---

## Project structure

```
src/
|-- context/
|   |-- AuthContext.jsx       # JWT auth + RBAC login
|   +-- ThemeContext.jsx      # Dark/light mode (localStorage)
|
|-- data/
|   |-- mockData.js           # All mock records, patients, claims
|   +-- api.js                # API layer (mock <-> real fetch toggle)
|
|-- components/
|   |-- Primitives.jsx        # Badge, Card, StatTile, SectionHeading
|   +-- ProtectedRoute.jsx    # RBAC route wrapper
|
|-- layouts/
|   +-- AppShell.jsx          # Sidebar + topbar
|
|-- pages/
|   |-- Login.jsx             # Role selection
|   |-- PatientPortal.jsx     # Patient dashboard
|   |-- ClinicDashboard.jsx   # Doctor/Nurse dashboard
|   |-- PharmacyDashboard.jsx # Pharmacy dashboard
|   |-- InsuranceDashboard.jsx# Insurance dashboard
|   +-- AdminDashboard.jsx    # Admin dashboard
|
|-- App.jsx                   # Router + layout
|-- main.jsx                  # React root
+-- index.css                 # Tailwind v4 + CSS theme tokens
```

---

## Colour system

| Token | Light | Dark |
|---|---|---|
| `--color-surface` | `#FFFFFF` | `#14191F` |
| `--color-surface-alt` | `#F4F8FC` | `#1A2029` |
| `--color-brand` | `#1857C9` | `#4C8DFF` |
| `--color-accent` | `#0EA5C9` | `#38C6E8` |
| `--color-text` | `#0E1B2C` | `#EAF0F8` |
| `--color-border` | `#DCE6F0` | `#2A3340` |

---

## Security model

| Mechanism | Implementation |
|---|---|
| Authentication | JWT with role + institutionId claims |
| Authorisation | RBAC via ProtectedRoute allow-list |
| Consent gate | Doctors blocked from history without active patient consent |
| Audit trail | Every record access logged: actor, institution, timestamp |
| API tokens | Per-institution tokens managed by Admin Service |
| Data minimisation | Insurance sees billing codes only, no clinical notes |

Aligned with Rwanda Law No. 058/2021 on Personal Data Protection and Privacy.

---

## Backend quick start (Docker Compose)

```bash
cd infra
docker compose build
docker compose up -d
docker compose ps

# Migrations
docker compose exec records-service alembic upgrade head
docker compose exec pharmacy-service alembic upgrade head
docker compose exec insurance-service alembic upgrade head
docker compose exec admin-service alembic upgrade head

# Smoke test
curl http://localhost/api/records/health
curl http://localhost/api/pharmacy/health
```

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |

---

## Team

| Member | Role | Owns |
|---|---|---|
| TBD | Lead Backend / Pair A | Records & Consent, Clinical Service |
| TBD | Backend / Pair A | Clinical Service, Clinic Dashboard |
| TBD | Backend / Pair B | Pharmacy Service, Pharmacy Dashboard |
| TBD | Backend / Pair B | Insurance Service, Insurance Dashboard |
| TBD | Infrastructure / Solo | Admin Service, Docker, HAProxy, CI/CD |

---

## Roadmap

- [ ] Wire all pages to live FastAPI endpoints (swap mocks in `api.js`)
- [ ] Patient registration flow
- [ ] Real-time notification badge (WebSocket / SSE)
- [ ] OpenAPI client auto-generation from FastAPI docs
- [ ] Mobile sidebar drawer
- [ ] FHIR R4 compliance layer
- [ ] Multi-city expansion

---

*Prototype interface only. No real patient data is stored or processed.*
