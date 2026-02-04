"""Add movements table

Revision ID: 002
Revises: 001
Create Date: 2026-02-04

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'movements',
        sa.Column('id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column('company_id', sqlmodel.sql.sqltypes.GUID(), nullable=False),
        sa.Column('agent_id', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('from_zone', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('to_zone', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('purpose', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column('artifact', sqlmodel.sql.sqltypes.AutoString(length=200), nullable=True),
        sa.Column('progress', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_movements_company_id'), 'movements', ['company_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_movements_company_id'), table_name='movements')
    op.drop_table('movements')
