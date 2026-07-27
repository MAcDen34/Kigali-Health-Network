"""add full_name to patients

Revision ID: 0004
Revises: 0003
Create Date: 2026-07-26
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("patients", sa.Column("full_name", sa.String(), nullable=True), schema="records")


def downgrade() -> None:
    op.drop_column("patients", "full_name", schema="records")
