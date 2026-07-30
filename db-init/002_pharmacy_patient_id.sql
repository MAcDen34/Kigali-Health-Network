-- Adds patient_id to pharmacy.prescriptions, denormalised from records.medical_records
-- for display purposes without a cross-schema FK. Nullable first for existing rows,
-- backfilled from the linked medical record, then locked to NOT NULL.

ALTER TABLE pharmacy.prescriptions ADD COLUMN IF NOT EXISTS patient_id UUID;

UPDATE pharmacy.prescriptions p
SET patient_id = m.patient_id
FROM records.medical_records m
WHERE p.record_id = m.id AND p.patient_id IS NULL;

ALTER TABLE pharmacy.prescriptions ALTER COLUMN patient_id SET NOT NULL;
