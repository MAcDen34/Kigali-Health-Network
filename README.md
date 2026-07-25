# KUPRIN — Kigali Unified Patient Records & Insurance Network

A permissioned, interoperable health data platform connecting clinics, hospitals, pharmacies, and insurance providers across Kigali, Rwanda.

**One city. Every patient. One secure network.**

> ALU Enterprise Systems Project · BSc. Software Engineering

---

## The Problem

Patient records in Kigali are siloed within individual providers. This causes:

- **Redundant diagnostics** — the same tests get repeated because prior results are inaccessible across providers
- **Drug interaction risk** — pharmacists lack a complete medication history for patients treated across multiple facilities
- **Delayed emergency care** — allergies and chronic conditions are unknown to attending teams in urgent situations
- **Insurance claim friction** — Mutuelle/RSSB documentation is scattered, slowing reimbursement cycles

## The Solution

A consent-gated, event-driven microservices platform where:
- Every cross-provider data access requires active patient consent (**fail-closed** by design — if consent can't be verified, access is denied, not silently allowed)
- Services communicate over REST for synchronous queries and Redis Streams for asynchronous events
- All access is audit-logged
- Clinical decision support only — final diagnosis always stays with the doctor

Aligned with Rwanda Law No. 058/2021 on Personal Data Protection and Privacy.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12, FastAPI |
| Database | PostgreSQL 16 (single instance, isolated schema per service) |
| Migrations | Alembic — every schema change is a versioned, reversible file |
| Async events | Redis 7 (Streams — persistent, consumer-group based, survives a subscriber briefly restarting) |
| Auth | PyJWT + bcrypt — real signed login tokens, shared secret across services |
| Frontend | React 19, Next.js 14, Tailwind CSS |
| Containerization | Docker & Docker Compose |
| Testing | Pytest, httpx |

---

## Architecture

Six microservices, each owning an isolated PostgreSQL schema (`records.*`, `pharmacy.*`, `clinical.*`, `admin.*`, `notify.*`), communicating via REST for synchronous calls and Redis Streams for async events. Cross-schema SQL joins are explicitly disallowed by design — services only talk to each other over the network, never by reaching into another service's tables directly.

```
                     ┌──────────────────┐
                     │   Next.js         │
                     │   Frontend        │
                     │  (role dashboards)│
                     └────────┬──────────┘
                              │ REST (fetch)
      ┌───────────┬───────────┼───────────┬───────────┐
      ▼           ▼           ▼           ▼           ▼
 ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────────┐
 │ Records │ │Clinical │ │Pharmacy │ │  Admin  │ │ Notification │
 │  :8000  │ │  :8001  │ │  :8002  │ │  :8004  │ │    :8005     │
 └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └──────┬───────┘
      └───────────┴─────┬─────┴───────────┴──────────────┘
                         ▼
              ┌───────────────────────┐
              │   PostgreSQL 16        │
              │  one schema per service│
              └───────────────────────┘
                         │
                         ▼
                 ┌───────────────┐
                 │   Redis 7      │
                 │   Streams       │
                 └───────────────┘
```

---

## Service Status

| Service | Status | Notes |
|---|---|---|
| **Records & Consent** | ✅ Built & tested (5 tests) | Patients, consent grant/check/revoke (fail-closed), medical records, audit logging, real patient login |
| **Pharmacy** | ✅ Built & tested (5 tests) | Prescriptions, dispensing (cross-service status update + double-dispense guard), interaction flags, publishes events to Redis |
| **Admin** | ✅ Built & tested (3 tests) | Institutions, staff, real staff login (Doctor/Nurse/Pharmacist/Insurance/Platform Admin), platform-wide audit |
| **Clinical** | ✅ Built & tested (8 tests) | Diagnoses, vitals, treatment plans; calls Records over REST to enforce the same fail-closed consent rule |
| **Notification** | ✅ Built & tested (3 tests) | Redis Streams consumer; real medicine-reminder scheduling, due/acknowledge lifecycle |
| **Frontend** | ✅ Built & wired | Next.js, role-based dashboards, real login against the actual backend (not demo/mock accounts) |
| **Auth** | ✅ Real | JWT-based, shared secret across services; patients and staff each have their own login endpoint (see Design Notes) |

**24 automated backend tests total, all passing.**

---

## Getting Started

### Prerequisites
- Docker Desktop
- Node.js (for the frontend)
- Python 3.10+ (for running the seed script and backend tests)

### 1. Set up your environment file

Copy the template and fill in real values — this file is gitignored and never committed:

```bash
cp .env.example .env
```

Generate real secret values rather than leaving placeholders:
```bash
python -c "import secrets; print(secrets.token_hex(32))"   # for JWT_SECRET
python -c "import secrets; print(secrets.token_hex(16))"   # for POSTGRES_PASSWORD
```

`.env` also holds the demo login credentials the seed script will create (`SEED_ADMIN_EMAIL`, `SEED_DOCTOR_PASSWORD`, etc.) — see `.env.example` for the full list.

### 2. Start everything

```bash
docker compose up -d
```

This starts PostgreSQL, Redis, and all five backend services. On a **completely fresh** database, Postgres automatically runs everything in `db-init/` once — creating all five schemas and the `pgcrypto` extension — before any service touches it. Nobody needs to create schemas by hand.

Confirm all seven containers are healthy:
```bash
docker ps
```

### 3. Seed demo data

```bash
python seed_data.py
```

This creates a demo patient (with medical history) and all five staff accounts, using the credentials from your `.env`. Safe to re-run any time — it skips anything that already exists rather than erroring.

### 4. Verify the backend

```bash
curl http://localhost:8000/health   # records-service
curl http://localhost:8001/health   # clinical-service
curl http://localhost:8002/health   # pharmacy-service
curl http://localhost:8004/health   # admin-service
curl http://localhost:8005/health   # notification-service
```

Interactive API docs (Swagger UI, auto-generated by FastAPI) are available for every service at `http://localhost:<port>/docs`.

### 5. Start the frontend

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with any of the accounts from your `.env`.

> **CORS note:** the frontend runs on `localhost:3000`, the backend services run on separate ports — each service that the frontend calls directly has CORS explicitly configured to allow `localhost:3000`. This will need updating to a real domain before deployment.

### Resetting your local environment

If your database ever gets into a confusing state, wipe it and start clean:

```bash
docker compose down -v
docker compose up -d
python seed_data.py
```

`-v` deletes the actual database volume, which is exactly what triggers `db-init/` to run again on the next startup.

---

## Running Tests

Each service has its own virtual environment and test suite (transaction-rollback pattern — tests never leave data behind in the real database).

```bash
cd services/records-service
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
pytest -v
```

Repeat inside each service's folder (`pharmacy-service`, `admin-service`, `clinical-service`, `notification-service`).

**Services whose tests touch JWT auth need the same secret your Docker containers use, exported into your shell first:**
```bash
export JWT_SECRET="<the same value from your .env>"     # Windows: set JWT_SECRET=...
```

**Current coverage (24 tests total):**
- `records-service` — 5 (patient create/404, full consent lifecycle with audit logging)
- `pharmacy-service` — 5 (prescription create/404, dispensing status flip, double-dispense guard)
- `admin-service` — 3 (login success/failure, protected-route access control)
- `clinical-service` — 8 (auth + role-based access control across diagnoses and vitals, with the consent-check call to records-service mocked)
- `notification-service` — 3 (reminder lookup, isolated-stream test of the Redis Streams consumer)

---

## Project Structure

```
Kigali-Health-Network/
├── app/                        # Next.js frontend (App Router)
├── components/                 # Shared React components
├── context/                    # Frontend app state
├── lib/                        # Frontend API client (fetch helpers)
├── utils/                      # Frontend auth helpers
├── db-init/                    # SQL run automatically on a fresh Postgres volume
├── seed_data.py                # Populates demo accounts/data from .env
├── .env.example                # Template — copy to .env and fill in real values
├── services/
│   ├── records-service/        # Patients, consent, medical records, audit, patient login
│   ├── clinical-service/       # Diagnoses, vitals, treatment plans
│   ├── pharmacy-service/       # Prescriptions, dispensing, interaction flags
│   ├── admin-service/          # Institutions, staff, staff login, platform audit
│   └── notification-service/   # Medicine reminder scheduling (Redis Streams consumer)
├── docker-compose.yml
└── README.md
```

Each backend service follows the same internal layout:
```
service-name/
├── app/
│   ├── main.py          # FastAPI app + router registration
│   ├── database.py      # SQLAlchemy engine/session setup
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── dependencies.py  # Auth (JWT) helpers, where applicable
│   └── routers/         # One router file per resource
├── tests/
├── Dockerfile
└── requirements.txt
```

`records-service` additionally has an `alembic/` folder — schema changes there go through a real migration, not `Base.metadata.create_all()`. See Design Notes.

---

## Design Notes

- **Consent is fail-closed.** If Records can't confirm active consent, access is denied — never assumed. Clinical enforces this a second time by calling Records over REST before touching clinical data.
- **No cross-schema SQL joins.** Even though all services share one PostgreSQL instance, tables in one schema never reference tables in another via a database-level foreign key. Cross-service references are plain UUIDs, verified over REST if needed — this keeps the services genuinely decoupled.
- **Two separate login systems, on purpose.** Patients log in via `records-service` (`POST /api/records/auth/login`); staff (Doctor, Nurse, Pharmacist, Insurance, Admin) log in via `admin-service` (`POST /api/admin/auth/login`). A patient isn't an employee of any institution, so folding them into the staff table would have been a shortcut with the wrong meaning. Both issue JWTs signed with the same shared `JWT_SECRET`, so tokens are consistently verifiable across services.
- **Backward-compatible auth.** `records-service`'s consent endpoints originally used a simpler `X-Actor-Id` header before real login existed. Rather than break existing tests, the dependency now accepts either the old header or a real `Authorization: Bearer` JWT.
- **Redis Streams, not plain Pub/Sub.** Pub/Sub was tried first and rejected — a message is silently lost if the subscriber is briefly offline. Streams keep a persistent, ordered log with consumer-group tracking, so an event (like a new prescription) is never dropped just because of bad timing.
- **Migrations, not just `create_all()`.** `records-service` uses Alembic; schema changes should go through a new migration file, not a hand-edited table. See `services/records-service/alembic/versions/` for examples.
- **Secrets never live in the repo.** `JWT_SECRET`, database passwords, and demo account credentials all come from `.env` (gitignored). `.env.example` documents what's needed without exposing real values.

---

## Team & Ownership

| Area | Owner(s) |
|---|---|
| Backend services, migrations, testing, integration | Denzel |
| Frontend design & redesign | Jay, Laura, Gevz |
| Database / infrastructure | Collins |

Weekly standups · GitHub Projects sprint board.

---

## References

- FastAPI — [fastapi.tiangolo.com](https://fastapi.tiangolo.com) (MIT)
- PostgreSQL 16 — [postgresql.org](https://postgresql.org)
- Redis 7 — [redis.io](https://redis.io) (BSD 3-Clause)
- SQLAlchemy / Alembic — [sqlalchemy.org](https://sqlalchemy.org) (MIT)
- PyJWT — [pyjwt.readthedocs.io](https://pyjwt.readthedocs.io) (MIT)
- React 19 / Next.js — [react.dev](https://react.dev) / [nextjs.org](https://nextjs.org) (MIT)
- Tailwind CSS — [tailwindcss.com](https://tailwindcss.com) (MIT)
- Republic of Rwanda (2021). *Law No. 058/2021 on Personal Data Protection and Privacy.*

All libraries used under their respective open-source licenses. No proprietary APIs used in this prototype.
