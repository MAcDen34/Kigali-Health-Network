"""
seed_data.py — populate a fresh KUPRIN database with demo data.
Usage: python3 seed_data.py
All credentials come from .env — none are hardcoded here.
Safe to re-run — every insert uses ON CONFLICT DO NOTHING.
"""

import os
import subprocess
import sys

PATIENT_ID = "82e6c070-9fef-4869-82b2-4ac45e7b7d30"
INSTITUTION_ID = "55555555-5555-5555-5555-555555555555"

STAFF_ROLES = [
    ("Admin",      "PLATFORM_ADMIN",  "Platform Admin",      "ADMIN"),
    ("Doctor",     "DOCTOR",          "Dr. Mugisha Eric",    "DOCTOR"),
    ("Nurse",      "NURSE",           "Nurse Keza Aline",    "NURSE"),
    ("Pharmacist", "PHARMACIST",      "Niyonsenga Patrick",  "PHARMACIST"),
    ("Insurance",  "INSURANCE_AGENT", "Mukamana Sandrine",   "INSURANCE"),
]

def load_dotenv(path=".env"):
    if not os.path.exists(path):
        print(f"No {path} file found. Copy .env.example to .env first.")
        sys.exit(1)
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())

def require_env(key):
    value = os.environ.get(key)
    if not value:
        print(f"Missing required value: {key} — add it to your .env file.")
        sys.exit(1)
    return value

def run(cmd, input_text=None, check=True):
    result = subprocess.run(cmd, input=input_text, capture_output=True, text=True)
    if check and result.returncode != 0:
        print(f"\n--- Command failed: {' '.join(cmd)} ---")
        print(result.stdout); print(result.stderr)
        sys.exit(1)
    return result.stdout.strip()

def container_id(name_filter):
    out = run(["docker", "ps", "-qf", f"name={name_filter}"])
    if not out:
        print(f"\nCould not find a running container matching '{name_filter}'.")
        print("Make sure `docker compose up -d` is running first.")
        sys.exit(1)
    return out.splitlines()[0]

def bcrypt_hash(container, password):
    script = f"import bcrypt; print(bcrypt.hashpw(b'{password}', bcrypt.gensalt()).decode())"
    return run(["docker", "exec", container, "python3", "-c", script])

def main():
    load_dotenv()
    patient_email = require_env("SEED_PATIENT_EMAIL")
    patient_password = require_env("SEED_PATIENT_PASSWORD")

    staff_accounts = []
    for label, role, name, prefix in STAFF_ROLES:
        email = require_env(f"SEED_{prefix}_EMAIL")
        password = require_env(f"SEED_{prefix}_PASSWORD")
        staff_accounts.append((label, role, name, email, password))

    print("Locating containers...")
    postgres = container_id("postgres")
    records = container_id("records-service")
    admin = container_id("admin-service")
    print("  postgres:", postgres[:12])
    print("  records-service:", records[:12])
    print("  admin-service:", admin[:12])

    print("\nHashing passwords...")
    patient_hash = bcrypt_hash(records, patient_password)
    staff_hashes = {email: bcrypt_hash(admin, password) for _, _, _, email, password in staff_accounts}

    sql_parts = [
        "CREATE EXTENSION IF NOT EXISTS pgcrypto;",
        f"""INSERT INTO records.patients (id, national_id, dob, blood_group, allergies, email, password_hash)
        VALUES ('{PATIENT_ID}', '1199012345678901', '1990-05-14', 'O+', ARRAY['penicillin'], '{patient_email}', '{patient_hash}')
        ON CONFLICT (id) DO NOTHING;""",
        f"""INSERT INTO records.consent_grants (id, patient_id, institution_id, granted_at)
        SELECT gen_random_uuid(), '{PATIENT_ID}', '{INSTITUTION_ID}', now()
        WHERE NOT EXISTS (SELECT 1 FROM records.consent_grants WHERE patient_id = '{PATIENT_ID}' AND institution_id = '{INSTITUTION_ID}' AND revoked_at IS NULL);""",
        f"""INSERT INTO records.medical_records (id, patient_id, type, content)
        SELECT gen_random_uuid(), '{PATIENT_ID}', 'Diagnosis', '{{"icd_code": "I10", "detail": "Hypertension — Stage 1", "institution": "King Faisal Hospital", "doctor": "Dr. Mugisha Eric"}}'::jsonb
        WHERE NOT EXISTS (SELECT 1 FROM records.medical_records WHERE patient_id = '{PATIENT_ID}' AND type = 'Diagnosis');""",
        f"""INSERT INTO records.medical_records (id, patient_id, type, content)
        SELECT gen_random_uuid(), '{PATIENT_ID}', 'Lab Result', '{{"detail": "Fasting glucose: 5.4 mmol/L (normal)", "institution": "King Faisal Hospital", "doctor": "Dr. Mugisha Eric"}}'::jsonb
        WHERE NOT EXISTS (SELECT 1 FROM records.medical_records WHERE patient_id = '{PATIENT_ID}' AND type = 'Lab Result');""",
        f"""INSERT INTO records.medical_records (id, patient_id, type, content)
        SELECT gen_random_uuid(), '{PATIENT_ID}', 'Vitals', '{{"detail": "BP 138/89, HR 76 bpm, Temp 36.7C", "institution": "King Faisal Hospital", "doctor": "Nurse Keza Aline"}}'::jsonb
        WHERE NOT EXISTS (SELECT 1 FROM records.medical_records WHERE patient_id = '{PATIENT_ID}' AND type = 'Vitals');""",
    ]

    for _, role, name, email, _ in staff_accounts:
        h = staff_hashes[email]
        sql_parts.append(f"""INSERT INTO admin.staff (id, full_name, email, password_hash, role, active)
        VALUES (gen_random_uuid(), '{name}', '{email}', '{h}', '{role}', true)
        ON CONFLICT (email) DO NOTHING;""")

    full_sql = "\n".join(sql_parts)
    print("Running seed SQL...")
    run(["docker", "exec", "-i", postgres, "psql", "-U", "kuprin", "-d", "kuprin"], input_text=full_sql)

    print("\nDone. Check your .env file for the actual emails/passwords to log in with.")
    print(f"Demo patient ID: {PATIENT_ID}")

if __name__ == "__main__":
    main()
