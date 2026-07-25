"""
seed_data.py — populate a fresh KUPRIN database with demo data.
Usage: python3 seed_data.py
All credentials come from .env — none are hardcoded here.
Safe to re-run — every insert uses ON CONFLICT DO NOTHING/UPDATE.
"""

import os
import subprocess
import sys

PATIENT_ID = "82e6c070-9fef-4869-82b2-4ac45e7b7d30"
INSTITUTION_ID = "55555555-5555-5555-5555-555555555555"  # legacy consent-grant institution ref, unrelated to admin.institutions

HOSPITAL_ID = "66666666-6666-6666-6666-666666666666"
CLINIC_ID = "77777777-7777-7777-7777-777777777777"

EXTRA_PATIENTS = [
    ("11111111-aaaa-1111-aaaa-111111111111", "Habimana Jean", "1198001234567890", "1980-04-12", "B+"),
    ("22222222-aaaa-2222-aaaa-222222222222", "Mukandayisenga A.", "1196701234567890", "1967-11-03", "AB+"),
    ("33333333-aaaa-3333-aaaa-333333333333", "Ndayisenga Eric", "1199901234567890", "1999-02-27", "O-"),
    ("44444444-aaaa-4444-aaaa-444444444444", "Ingabire Claudette", "1199001234567890", "1990-08-15", "A+"),
]

# label, role, display name, env var prefix, institution_id (or None)
STAFF_ROLES = [
    ("Admin",      "PLATFORM_ADMIN",  "Platform Admin",      "ADMIN",      None),
    ("Doctor",     "DOCTOR",          "Dr. Mugisha Eric",    "DOCTOR",     HOSPITAL_ID),
    ("Nurse",      "NURSE",           "Nurse Keza Aline",    "NURSE",      HOSPITAL_ID),
    ("Pharmacist", "PHARMACIST",      "Niyonsenga Patrick",  "PHARMACIST", None),
    ("Insurance",  "INSURANCE_AGENT", "Mukamana Sandrine",   "INSURANCE",  None),
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
    for label, role, name, prefix, inst_id in STAFF_ROLES:
        email = require_env(f"SEED_{prefix}_EMAIL")
        password = require_env(f"SEED_{prefix}_PASSWORD")
        staff_accounts.append((label, role, name, email, password, inst_id))

    print("Locating containers...")
    postgres = container_id("postgres")
    records = container_id("records-service")
    admin = container_id("admin-service")
    print("  postgres:", postgres[:12])
    print("  records-service:", records[:12])
    print("  admin-service:", admin[:12])

    print("\nHashing passwords...")
    patient_hash = bcrypt_hash(records, patient_password)
    staff_hashes = {email: bcrypt_hash(admin, password) for _, _, _, email, password, _ in staff_accounts}

    sql_parts = [
        "CREATE EXTENSION IF NOT EXISTS pgcrypto;",

        f"""INSERT INTO records.patients (id, full_name, national_id, dob, blood_group, allergies, email, password_hash)
        VALUES ('{PATIENT_ID}', 'Uwase Diane', '1199012345678901', '1990-05-14', 'O+', ARRAY['penicillin'], '{patient_email}', '{patient_hash}')
        ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;""",

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

        # Real institutions — one active, one pending approval
        f"""INSERT INTO admin.institutions (id, name, type, staff_count, active)
        VALUES ('{HOSPITAL_ID}', 'King Faisal Hospital', 'Hospital', 2, true)
        ON CONFLICT (id) DO NOTHING;""",
        f"""INSERT INTO admin.institutions (id, name, type, staff_count, active)
        VALUES ('{CLINIC_ID}', 'Legacy Clinic — Remera', 'Clinic', 0, false)
        ON CONFLICT (id) DO NOTHING;""",
    ]

    for pid, name, national_id, dob, blood_group in EXTRA_PATIENTS:
        sql_parts.append(f"""INSERT INTO records.patients (id, full_name, national_id, dob, blood_group, allergies)
        VALUES ('{pid}', '{name}', '{national_id}', '{dob}', '{blood_group}', ARRAY[]::text[])
        ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;""")
        sql_parts.append(f"""INSERT INTO records.consent_grants (id, patient_id, institution_id, granted_at)
        SELECT gen_random_uuid(), '{pid}', '{INSTITUTION_ID}', now()
        WHERE NOT EXISTS (SELECT 1 FROM records.consent_grants WHERE patient_id = '{pid}' AND institution_id = '{INSTITUTION_ID}' AND revoked_at IS NULL);""")

    for _, role, name, email, _, inst_id in staff_accounts:
        h = staff_hashes[email]
        inst_sql = f"'{inst_id}'" if inst_id else "NULL"
        sql_parts.append(f"""INSERT INTO admin.staff (id, full_name, email, password_hash, role, institution_id, active)
        VALUES (gen_random_uuid(), '{name}', '{email}', '{h}', '{role}', {inst_sql}, true)
        ON CONFLICT (email) DO NOTHING;""")

    full_sql = "\n".join(sql_parts)
    print("Running seed SQL...")
    run(["docker", "exec", "-i", postgres, "psql", "-U", "kuprin", "-d", "kuprin"], input_text=full_sql)

    print("\nDone. Check your .env file for the actual emails/passwords to log in with.")
    print(f"Demo patient ID: {PATIENT_ID}")
    print(f"Plus {len(EXTRA_PATIENTS)} additional named patients, 2 institutions seeded.")

if __name__ == "__main__":
    main()
