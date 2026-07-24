"""add patient email and password_hash for real auth

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-24
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("patients", sa.Column("email", sa.String(), nullable=True), schema="records")
    op.add_column("patients", sa.Column("password_hash", sa.String(), nullable=True), schema="records")
    op.create_unique_constraint("uq_patients_email", "patients", ["email"], schema="records")


def downgrade() -> None:
    op.drop_constraint("uq_patients_email", "patients", schema="records", type_="unique")
    op.drop_column("patients", "password_hash", schema="records")
    op.drop_column("patients", "email", schema="records")
