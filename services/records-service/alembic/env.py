from logging.config import fileConfig

import sqlalchemy as sa
from sqlalchemy import engine_from_config, pool

from alembic import context

# Import the app's Base + DATABASE_URL, and the models module so that
# every table registers itself on Base.metadata (needed for autogenerate).
from app.database import Base, DATABASE_URL
from app import models  # noqa: F401

# This service owns the "records" schema. Keeping Alembic's version table
# inside it means each service tracks its own migration history separately,
# so services sharing one Postgres don't collide on a single
# public.alembic_version table.
VERSION_TABLE_SCHEMA = "records"

config = context.config

# Feed the app's DATABASE_URL into Alembic rather than hardcoding it here.
config.set_main_option("sqlalchemy.url", DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Emit SQL to stdout without a live DB connection (`--sql` mode)."""
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        include_schemas=True,
        version_table_schema=VERSION_TABLE_SCHEMA,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations against a live database connection."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        # The version table lives inside this service's own schema, so the
        # schema must exist before Alembic tries to create that table.
        connection.execute(sa.text(f"CREATE SCHEMA IF NOT EXISTS {VERSION_TABLE_SCHEMA}"))
        connection.commit()

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_schemas=True,
            version_table_schema=VERSION_TABLE_SCHEMA,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()