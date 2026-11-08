"""add_store_account_details_and_user_columns

Revision ID: 1128be650aaf
Revises: 
Create Date: 2026-11-08 09:31:41.359360

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1128be650aaf'
down_revision: Union[str, Sequence[str], None] = None
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
    # 1. users table
    _add_column_if_missing('users', sa.Column('shop_category', sa.String(100), nullable=True))
    _add_column_if_missing('users', sa.Column('plain_password', sa.String(255), nullable=True))
    _add_column_if_missing('users', sa.Column('shop_category_id', sa.Integer(), nullable=True))
    _add_column_if_missing('users', sa.Column('last_login', sa.DateTime(), nullable=True))

    # 2. stores table
    _add_column_if_missing('stores', sa.Column('store_code', sa.String(50), nullable=True))
    _add_column_if_missing('stores', sa.Column('store_type', sa.String(100), server_default='Supermarket', nullable=True))
    _add_column_if_missing('stores', sa.Column('store_category', sa.String(100), server_default='Retail', nullable=True))
    _add_column_if_missing('stores', sa.Column('description', sa.Text(), nullable=True))
    _add_column_if_missing('stores', sa.Column('image_url', sa.String(500), server_default='store.jpg', nullable=True))
    _add_column_if_missing('stores', sa.Column('store_status', sa.String(50), server_default='Active', nullable=False))
    _add_column_if_missing('stores', sa.Column('registration_date', sa.String(50), nullable=True))
    _add_column_if_missing('stores', sa.Column('created_by', sa.String(100), nullable=True))
    _add_column_if_missing('stores', sa.Column('updated_by', sa.String(100), nullable=True))

    # 3. store_owner_details table
    _add_column_if_missing('store_owner_details', sa.Column('owner_id', sa.String(50), server_default='OWN001', nullable=True))
    _add_column_if_missing('store_owner_details', sa.Column('alternate_phone', sa.String(50), nullable=True))
    _add_column_if_missing('store_owner_details', sa.Column('owner_address', sa.Text(), nullable=True))
    _add_column_if_missing('store_owner_details', sa.Column('owner_profile_image', sa.String(500), server_default='owner.png', nullable=True))

    # 4. store_addresses table
    _add_column_if_missing('store_addresses', sa.Column('landmark', sa.String(255), nullable=True))
    _add_column_if_missing('store_addresses', sa.Column('district', sa.String(100), nullable=True))

    # 5. store_business_details table
    _add_column_if_missing('store_business_details', sa.Column('pan_number', sa.String(50), nullable=True))
    _add_column_if_missing('store_business_details', sa.Column('business_email', sa.String(255), nullable=True))
    _add_column_if_missing('store_business_details', sa.Column('business_phone', sa.String(50), nullable=True))

    # 6. store_configurations table
    _add_column_if_missing('store_configurations', sa.Column('store_opening_time', sa.String(20), server_default='09:00 AM', nullable=False))
    _add_column_if_missing('store_configurations', sa.Column('store_closing_time', sa.String(20), server_default='10:00 PM', nullable=False))
    _add_column_if_missing('store_configurations', sa.Column('working_days', sa.String(100), server_default='Monday - Saturday', nullable=False))
    _add_column_if_missing('store_configurations', sa.Column('currency', sa.String(20), server_default='INR', nullable=False))
    _add_column_if_missing('store_configurations', sa.Column('default_tax_rate', sa.Float(), server_default='5.0', nullable=False))
    _add_column_if_missing('store_configurations', sa.Column('invoice_starting_number', sa.Integer(), server_default='1', nullable=False))
    _add_column_if_missing('store_configurations', sa.Column('low_stock_alert', sa.Integer(), server_default='5', nullable=False))
    _add_column_if_missing('store_configurations', sa.Column('return_period', sa.String(50), server_default='7 Days', nullable=False))
    _add_column_if_missing('store_configurations', sa.Column('store_language', sa.String(50), server_default='English', nullable=False))

    # 7. document_sequences table
    _add_column_if_missing('document_sequences', sa.Column('multi_store_code', sa.String(50), server_default='STR001', nullable=True))
    _add_column_if_missing('document_sequences', sa.Column('sample_example', sa.String(100), nullable=True))


def downgrade() -> None:
    pass
