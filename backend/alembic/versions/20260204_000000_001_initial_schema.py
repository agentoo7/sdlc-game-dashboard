"""Initial database schema

Revision ID: 001
Revises:
Create Date: 2026-02-04

"""
from typing import Sequence, Union

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create companies table
    op.create_table(
        "companies",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column("description", sqlmodel.sql.sqltypes.AutoString(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_companies_name"), "companies", ["name"], unique=False)

    # Create role_configs table
    op.create_table(
        "role_configs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("role_id", sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column("display_name", sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column("color", sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False),
        sa.Column("zone_color", sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column("is_default", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_role_configs_role_id"), "role_configs", ["role_id"], unique=True)

    # Create agents table
    op.create_table(
        "agents",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("company_id", sa.Uuid(), nullable=False),
        sa.Column("agent_id", sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column("name", sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column("role", sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column("status", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("current_task", sqlmodel.sql.sqltypes.AutoString(length=500), nullable=True),
        sa.Column("position_zone", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("position_x", sa.Float(), nullable=False),
        sa.Column("position_y", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_agents_agent_id"), "agents", ["agent_id"], unique=False)
    op.create_index(op.f("ix_agents_company_id"), "agents", ["company_id"], unique=False)

    # Create events table
    op.create_table(
        "events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("company_id", sa.Uuid(), nullable=False),
        sa.Column("from_agent_id", sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column("to_agent_id", sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column("event_type", sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("inferred_actions", sa.JSON(), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_events_company_id"), "events", ["company_id"], unique=False)
    op.create_index(op.f("ix_events_timestamp"), "events", ["timestamp"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_events_timestamp"), table_name="events")
    op.drop_index(op.f("ix_events_company_id"), table_name="events")
    op.drop_table("events")

    op.drop_index(op.f("ix_agents_company_id"), table_name="agents")
    op.drop_index(op.f("ix_agents_agent_id"), table_name="agents")
    op.drop_table("agents")

    op.drop_index(op.f("ix_role_configs_role_id"), table_name="role_configs")
    op.drop_table("role_configs")

    op.drop_index(op.f("ix_companies_name"), table_name="companies")
    op.drop_table("companies")
