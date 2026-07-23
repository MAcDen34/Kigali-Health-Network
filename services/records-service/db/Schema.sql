CREATE SCHEMA IF NOT EXISTS records;

CREATE TABLE records.patients (
    id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    national_id  TEXT    NOT NULL UNIQUE,
    dob          DATE    NOT NULL,
    blood_group  TEXT,
    allergies    TEXT[]  DEFAULT '{}'
);

CREATE TABLE records.consent_grants (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id      UUID         NOT NULL REFERENCES records.patients(id),
    institution_id  UUID         NOT NULL,
    granted_at      TIMESTAMPTZ  DEFAULT now(),
    revoked_at      TIMESTAMPTZ
);


CREATE TABLE records.medical_records (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id  UUID         NOT NULL REFERENCES records.patients(id),
    type        TEXT         NOT NULL,
    content     JSONB,
    created_at  TIMESTAMPTZ  DEFAULT now()
);


CREATE TABLE records.audit_log (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID         NOT NULL,
    patient_id  UUID         NOT NULL REFERENCES records.patients(id),
    action      TEXT         NOT NULL,
    timestamp   TIMESTAMPTZ  DEFAULT now(),
    ip_address  TEXT
);


CREATE INDEX idx_consent_grants_patient_id  ON records.consent_grants (patient_id);
CREATE INDEX idx_medical_records_patient_id ON records.medical_records (patient_id);
CREATE INDEX idx_audit_log_patient_id       ON records.audit_log (patient_id);