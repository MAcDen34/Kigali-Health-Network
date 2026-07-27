"""add active flag to patients for soft-delete

Revision ID: 0003
Revises: 0002
Create Date: 2026-07-24
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "patients",
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.true()),
        schema="records",
    )


def downgrade() -> None:
    op.drop_column("patients", "active", schema="records")
