"""add_store_types_and_refresh_tokens

Revision ID: 2a3b4c5d6e7f
Revises: 1128be650aaf
Create Date: 2026-11-10 00:35:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '2a3b4c5d6e7f'
down_revision: Union[str, Sequence[str], None] = '1128be650aaf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _add_column_if_missing(table_name: str, column: sa.Column):
    bind = op.get_bind()
    insp = sa.inspect(bind)
    tables = insp.get_table_names()
    if table_name in tables:
        columns = [c['name'] for c in insp.get_columns(table_name)]
        if column.name not in columns:
            op.add_column(table_name, column)


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    tables = insp.get_table_names()

    # 1. Create store_types table if not exists
    if 'store_types' not in tables:
        op.create_table(
            'store_types',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('code', sa.String(50), nullable=False),
            sa.Column('name', sa.String(100), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('icon', sa.String(100), nullable=True),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_store_types_id', 'store_types', ['id'])
        op.create_index('ix_store_types_code', 'store_types', ['code'], unique=True)
        op.create_index('ix_store_types_is_active', 'store_types', ['is_active'])

    # 2. Create refresh_tokens table if not exists
    if 'refresh_tokens' not in tables:
        op.create_table(
            'refresh_tokens',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('token_hash', sa.String(255), nullable=False),
            sa.Column('session_id', sa.String(100), nullable=False),
            sa.Column('expires_at', sa.DateTime(), nullable=False),
            sa.Column('revoked_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('last_used_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_refresh_tokens_id', 'refresh_tokens', ['id'])
        op.create_index('ix_refresh_tokens_user_id', 'refresh_tokens', ['user_id'])
        op.create_index('ix_refresh_tokens_token_hash', 'refresh_tokens', ['token_hash'], unique=True)
        op.create_index('ix_refresh_tokens_session_id', 'refresh_tokens', ['session_id'])
        op.create_index('ix_refresh_tokens_expires_at', 'refresh_tokens', ['expires_at'])
        op.create_index('ix_refresh_tokens_revoked_at', 'refresh_tokens', ['revoked_at'])

    # 3. Add store_type_id to stores table
    _add_column_if_missing('stores', sa.Column('store_type_id', sa.Integer(), nullable=True))


def downgrade() -> None:
    pass

