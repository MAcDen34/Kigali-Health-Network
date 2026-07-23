"""initial records schema

Revision ID: 0001
Revises:
Create Date: 2026-07-16

Creates the "records" schema namespace and its four tables
(patients, consent_grants, medical_records, audit_log) plus
foreign-key indexes. Mirrors app/models.py.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    
    op.execute("CREATE SCHEMA IF NOT EXISTS records")

    op.create_table(
        "patients",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("national_id", sa.Text(), nullable=False),
        sa.Column("dob", sa.Date(), nullable=False),
        sa.Column("blood_group", sa.Text(), nullable=True),
        sa.Column(
            "allergies",
            postgresql.ARRAY(sa.Text()),
            server_default=sa.text("'{}'"),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("national_id"),
        schema="records",
    )

    op.create_table(
        "consent_grants",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("institution_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "granted_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["patient_id"], ["records.patients.id"]),
        schema="records",
    )

    op.create_table(
        "medical_records",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("type", sa.Text(), nullable=False),
        sa.Column("content", postgresql.JSONB(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["patient_id"], ["records.patients.id"]),
        schema="records",
    )

    op.create_table(
        "audit_log",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("action", sa.Text(), nullable=False),
        sa.Column(
            "timestamp",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("ip_address", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["patient_id"], ["records.patients.id"]),
        schema="records",
    )

    op.create_index(
        "idx_consent_grants_patient_id",
        "consent_grants",
        ["patient_id"],
        schema="records",
    )
    op.create_index(
        "idx_medical_records_patient_id",
        "medical_records",
        ["patient_id"],
        schema="records",
    )
    op.create_index(
        "idx_audit_log_patient_id",
        "audit_log",
        ["patient_id"],
        schema="records",
    )


def downgrade() -> None:
    op.drop_index("idx_audit_log_patient_id", table_name="audit_log", schema="records")
    op.drop_index(
        "idx_medical_records_patient_id", table_name="medical_records", schema="records"
    )
    op.drop_index(
        "idx_consent_grants_patient_id", table_name="consent_grants", schema="records"
    )
    op.drop_table("audit_log", schema="records")
    op.drop_table("medical_records", schema="records")
    op.drop_table("consent_grants", schema="records")
    op.drop_table("patients", schema="records")
    op.execute("DROP SCHEMA IF EXISTS records CASCADE")