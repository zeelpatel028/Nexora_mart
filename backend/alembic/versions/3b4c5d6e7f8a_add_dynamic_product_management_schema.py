"""add_dynamic_product_management_schema

Revision ID: 3b4c5d6e7f8a
Revises: 2a3b4c5d6e7f
Create Date: 2026-11-11 10:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '3b4c5d6e7f8a'
down_revision: Union[str, Sequence[str], None] = '2a3b4c5d6e7f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    tables = insp.get_table_names()

    # 1. Brands
    if 'brands' not in tables:
        op.create_table(
            'brands',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('name', sa.String(100), nullable=False),
            sa.Column('code', sa.String(50), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('logo_url', sa.String(500), nullable=True),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_brands_id', 'brands', ['id'])
        op.create_index('ix_brands_store_id', 'brands', ['store_id'])
        op.create_index('ix_brands_name', 'brands', ['name'])

    # 2. Categories
    if 'categories' not in tables:
        op.create_table(
            'categories',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('name', sa.String(100), nullable=False),
            sa.Column('code', sa.String(50), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('icon', sa.String(100), nullable=True),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_categories_id', 'categories', ['id'])
        op.create_index('ix_categories_store_id', 'categories', ['store_id'])
        op.create_index('ix_categories_name', 'categories', ['name'])

    # 3. Store Users
    if 'store_users' not in tables:
        op.create_table(
            'store_users',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
            sa.Column('role', sa.String(50), server_default='STAFF', nullable=False),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_store_users_id', 'store_users', ['id'])
        op.create_index('ix_store_users_store_id', 'store_users', ['store_id'])
        op.create_index('ix_store_users_user_id', 'store_users', ['user_id'])

    # 4. Store Settings
    if 'store_settings' not in tables:
        op.create_table(
            'store_settings',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('allow_negative_stock', sa.Boolean(), server_default=sa.text('0'), nullable=False),
            sa.Column('low_stock_threshold', sa.Integer(), server_default='5', nullable=False),
            sa.Column('enable_barcode_scanner', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('tax_inclusive_pricing', sa.Boolean(), server_default=sa.text('0'), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_store_settings_id', 'store_settings', ['id'])
        op.create_index('ix_store_settings_store_id', 'store_settings', ['store_id'], unique=True)

    # 5. Product Pricing
    if 'product_pricing' not in tables:
        op.create_table(
            'product_pricing',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('purchase_price', sa.Numeric(12, 2), server_default='0.00', nullable=False),
            sa.Column('selling_price', sa.Numeric(12, 2), server_default='0.00', nullable=False),
            sa.Column('mrp', sa.Numeric(12, 2), nullable=True),
            sa.Column('wholesale_price', sa.Numeric(12, 2), nullable=True),
            sa.Column('discount_type', sa.String(50), nullable=True),
            sa.Column('discount_value', sa.Numeric(12, 2), server_default='0.00', nullable=True),
            sa.Column('tax_type', sa.String(50), server_default='exclusive', nullable=False),
            sa.Column('gst_rate', sa.Numeric(5, 2), server_default='0.00', nullable=False),
            sa.Column('cgst_rate', sa.Numeric(5, 2), server_default='0.00', nullable=False),
            sa.Column('sgst_rate', sa.Numeric(5, 2), server_default='0.00', nullable=False),
            sa.Column('igst_rate', sa.Numeric(5, 2), server_default='0.00', nullable=False),
            sa.Column('cess_rate', sa.Numeric(5, 2), server_default='0.00', nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_product_pricing_id', 'product_pricing', ['id'])
        op.create_index('ix_product_pricing_store_id', 'product_pricing', ['store_id'])
        op.create_index('ix_product_pricing_product_id', 'product_pricing', ['product_id'], unique=True)

    # 6. Product Inventory
    if 'product_inventory' not in tables:
        op.create_table(
            'product_inventory',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('opening_stock', sa.Numeric(12, 3), server_default='0.000', nullable=False),
            sa.Column('current_stock', sa.Numeric(12, 3), server_default='0.000', nullable=False),
            sa.Column('reserved_stock', sa.Numeric(12, 3), server_default='0.000', nullable=False),
            sa.Column('minimum_stock', sa.Numeric(12, 3), server_default='5.000', nullable=False),
            sa.Column('maximum_stock', sa.Numeric(12, 3), nullable=True),
            sa.Column('reorder_level', sa.Numeric(12, 3), server_default='10.000', nullable=False),
            sa.Column('warehouse_location', sa.String(100), nullable=True),
            sa.Column('last_stock_update', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_product_inventory_id', 'product_inventory', ['id'])
        op.create_index('ix_product_inventory_store_id', 'product_inventory', ['store_id'])
        op.create_index('ix_product_inventory_product_id', 'product_inventory', ['product_id'], unique=True)

    # 7. Product Alerts
    if 'product_alerts' not in tables:
        op.create_table(
            'product_alerts',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('alert_type', sa.String(50), nullable=False),
            sa.Column('threshold_value', sa.Numeric(12, 3), nullable=True),
            sa.Column('alert_days_before', sa.Integer(), nullable=True),
            sa.Column('is_enabled', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('notify_email', sa.Boolean(), server_default=sa.text('0'), nullable=False),
            sa.Column('notify_sms', sa.Boolean(), server_default=sa.text('0'), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_product_alerts_id', 'product_alerts', ['id'])
        op.create_index('ix_product_alerts_store_id', 'product_alerts', ['store_id'])
        op.create_index('ix_product_alerts_product_id', 'product_alerts', ['product_id'])

    # 8. Product Batches
    if 'product_batches' not in tables:
        op.create_table(
            'product_batches',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('batch_number', sa.String(100), nullable=False),
            sa.Column('manufacturing_date', sa.DateTime(), nullable=True),
            sa.Column('expiry_date', sa.DateTime(), nullable=True),
            sa.Column('purchase_price', sa.Numeric(12, 2), server_default='0.00', nullable=False),
            sa.Column('selling_price', sa.Numeric(12, 2), server_default='0.00', nullable=False),
            sa.Column('mrp', sa.Numeric(12, 2), nullable=True),
            sa.Column('initial_quantity', sa.Numeric(12, 3), server_default='0.000', nullable=False),
            sa.Column('current_quantity', sa.Numeric(12, 3), server_default='0.000', nullable=False),
            sa.Column('supplier_id', sa.Integer(), nullable=True),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_product_batches_id', 'product_batches', ['id'])
        op.create_index('ix_product_batches_store_id', 'product_batches', ['store_id'])
        op.create_index('ix_product_batches_product_id', 'product_batches', ['product_id'])
        op.create_index('ix_product_batches_expiry_date', 'product_batches', ['expiry_date'])

    # 9. Product Serial Numbers
    if 'product_serial_numbers' not in tables:
        op.create_table(
            'product_serial_numbers',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('serial_number', sa.String(100), nullable=False),
            sa.Column('imei_number', sa.String(100), nullable=True),
            sa.Column('status', sa.String(50), server_default='available', nullable=False),
            sa.Column('warranty_start_date', sa.DateTime(), nullable=True),
            sa.Column('warranty_end_date', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_product_serial_numbers_id', 'product_serial_numbers', ['id'])
        op.create_index('ix_product_serial_numbers_store_id', 'product_serial_numbers', ['store_id'])
        op.create_index('ix_product_serial_numbers_product_id', 'product_serial_numbers', ['product_id'])
        op.create_index('ix_product_serial_numbers_serial_number', 'product_serial_numbers', ['serial_number'])

    # 10. Store-Specific Detail Tables (8 tables)
    detail_tables = {
        'product_grocery_details': [
            sa.Column('food_type', sa.String(50), nullable=True),
            sa.Column('item_type', sa.String(100), nullable=True),
            sa.Column('net_weight', sa.String(50), nullable=True),
            sa.Column('gross_weight', sa.String(50), nullable=True),
            sa.Column('packaging_type', sa.String(100), nullable=True),
            sa.Column('manufacturer', sa.String(200), nullable=True),
            sa.Column('country_of_origin', sa.String(100), nullable=True),
            sa.Column('manufacturing_date', sa.DateTime(), nullable=True),
            sa.Column('expiry_date', sa.DateTime(), nullable=True),
            sa.Column('shelf_life_days', sa.Integer(), nullable=True),
            sa.Column('is_vegetarian', sa.Boolean(), server_default=sa.text('1'), nullable=True),
            sa.Column('storage_type', sa.String(100), nullable=True),
            sa.Column('nutritional_information', sa.Text(), nullable=True),
            sa.Column('ingredients', sa.Text(), nullable=True),
            sa.Column('fssai_license', sa.String(100), nullable=True),
        ],
        'product_clothing_details': [
            sa.Column('gender', sa.String(50), nullable=True),
            sa.Column('clothing_type', sa.String(100), nullable=True),
            sa.Column('fabric_type', sa.String(100), nullable=True),
            sa.Column('material', sa.String(100), nullable=True),
            sa.Column('pattern', sa.String(100), nullable=True),
            sa.Column('fit_type', sa.String(100), nullable=True),
            sa.Column('sleeve_type', sa.String(100), nullable=True),
            sa.Column('neck_type', sa.String(100), nullable=True),
            sa.Column('occasion', sa.String(100), nullable=True),
            sa.Column('season', sa.String(100), nullable=True),
            sa.Column('care_instructions', sa.Text(), nullable=True),
            sa.Column('country_of_origin', sa.String(100), nullable=True),
            sa.Column('manufacturer', sa.String(200), nullable=True),
            sa.Column('collection_name', sa.String(150), nullable=True),
        ],
        'product_medicine_details': [
            sa.Column('medicine_type', sa.String(100), nullable=True),
            sa.Column('salt_composition', sa.Text(), nullable=True),
            sa.Column('generic_name', sa.String(255), nullable=True),
            sa.Column('strength', sa.String(100), nullable=True),
            sa.Column('dosage_form', sa.String(100), nullable=True),
            sa.Column('prescription_required', sa.Boolean(), server_default=sa.text('0'), nullable=True),
            sa.Column('schedule_type', sa.String(50), nullable=True),
            sa.Column('manufacturer', sa.String(200), nullable=True),
            sa.Column('pack_size', sa.String(100), nullable=True),
            sa.Column('storage_conditions', sa.String(200), nullable=True),
            sa.Column('drug_license_number', sa.String(100), nullable=True),
            sa.Column('therapeutic_category', sa.String(150), nullable=True),
            sa.Column('side_effects', sa.Text(), nullable=True),
            sa.Column('usage_instructions', sa.Text(), nullable=True),
        ],
        'product_electronics_details': [
            sa.Column('device_type', sa.String(100), nullable=True),
            sa.Column('model_number', sa.String(100), nullable=True),
            sa.Column('model_name', sa.String(150), nullable=True),
            sa.Column('manufacturer', sa.String(200), nullable=True),
            sa.Column('brand_model', sa.String(150), nullable=True),
            sa.Column('color', sa.String(50), nullable=True),
            sa.Column('ram', sa.String(50), nullable=True),
            sa.Column('storage_capacity', sa.String(50), nullable=True),
            sa.Column('processor', sa.String(150), nullable=True),
            sa.Column('screen_size', sa.String(50), nullable=True),
            sa.Column('battery_capacity', sa.String(50), nullable=True),
            sa.Column('connectivity', sa.String(150), nullable=True),
            sa.Column('warranty_months', sa.Integer(), nullable=True),
            sa.Column('warranty_type', sa.String(100), nullable=True),
            sa.Column('power_rating', sa.String(50), nullable=True),
            sa.Column('country_of_origin', sa.String(100), nullable=True),
        ],
        'product_plastic_details': [
            sa.Column('plastic_type', sa.String(100), nullable=True),
            sa.Column('material_grade', sa.String(100), nullable=True),
            sa.Column('material_type', sa.String(100), nullable=True),
            sa.Column('color', sa.String(50), nullable=True),
            sa.Column('length', sa.String(50), nullable=True),
            sa.Column('width', sa.String(50), nullable=True),
            sa.Column('height', sa.String(50), nullable=True),
            sa.Column('thickness', sa.String(50), nullable=True),
            sa.Column('weight', sa.String(50), nullable=True),
            sa.Column('capacity', sa.String(50), nullable=True),
            sa.Column('capacity_unit', sa.String(50), nullable=True),
            sa.Column('food_grade', sa.Boolean(), server_default=sa.text('0'), nullable=True),
            sa.Column('recyclable', sa.Boolean(), server_default=sa.text('1'), nullable=True),
            sa.Column('usage_type', sa.String(100), nullable=True),
        ],
        'product_handloom_details': [
            sa.Column('fabric_type', sa.String(100), nullable=True),
            sa.Column('weaving_type', sa.String(100), nullable=True),
            sa.Column('craft_type', sa.String(100), nullable=True),
            sa.Column('material', sa.String(100), nullable=True),
            sa.Column('thread_count', sa.String(50), nullable=True),
            sa.Column('design_name', sa.String(150), nullable=True),
            sa.Column('pattern', sa.String(100), nullable=True),
            sa.Column('origin_region', sa.String(150), nullable=True),
            sa.Column('artisan_name', sa.String(150), nullable=True),
            sa.Column('handwoven', sa.Boolean(), server_default=sa.text('1'), nullable=True),
            sa.Column('length', sa.String(50), nullable=True),
            sa.Column('width', sa.String(50), nullable=True),
            sa.Column('color', sa.String(50), nullable=True),
            sa.Column('care_instructions', sa.Text(), nullable=True),
        ],
        'product_furniture_details': [
            sa.Column('furniture_type', sa.String(100), nullable=True),
            sa.Column('material', sa.String(100), nullable=True),
            sa.Column('frame_material', sa.String(100), nullable=True),
            sa.Column('finish_type', sa.String(100), nullable=True),
            sa.Column('length', sa.String(50), nullable=True),
            sa.Column('width', sa.String(50), nullable=True),
            sa.Column('height', sa.String(50), nullable=True),
            sa.Column('weight', sa.String(50), nullable=True),
            sa.Column('seating_capacity', sa.Integer(), nullable=True),
            sa.Column('assembly_required', sa.Boolean(), server_default=sa.text('0'), nullable=True),
            sa.Column('warranty_months', sa.Integer(), nullable=True),
            sa.Column('room_type', sa.String(100), nullable=True),
            sa.Column('color', sa.String(50), nullable=True),
        ],
        'product_agro_details': [
            sa.Column('agro_category', sa.String(100), nullable=True),
            sa.Column('product_type', sa.String(100), nullable=True),
            sa.Column('crop_name', sa.String(150), nullable=True),
            sa.Column('seed_variety', sa.String(150), nullable=True),
            sa.Column('brand_name', sa.String(150), nullable=True),
            sa.Column('composition', sa.Text(), nullable=True),
            sa.Column('active_ingredient', sa.String(200), nullable=True),
            sa.Column('concentration', sa.String(100), nullable=True),
            sa.Column('application_method', sa.String(150), nullable=True),
            sa.Column('recommended_crop', sa.String(255), nullable=True),
            sa.Column('dosage', sa.String(150), nullable=True),
            sa.Column('pack_size', sa.String(100), nullable=True),
            sa.Column('manufacturer', sa.String(200), nullable=True),
            sa.Column('license_number', sa.String(100), nullable=True),
            sa.Column('safety_instructions', sa.Text(), nullable=True),
        ]
    }

    for tbl_name, extra_cols in detail_tables.items():
        if tbl_name not in tables:
            cols = [
                sa.Column('id', sa.String(36), nullable=False),
                sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
                sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id', ondelete='CASCADE'), nullable=False),
            ] + extra_cols + [
                sa.Column('created_at', sa.DateTime(), nullable=True),
                sa.Column('updated_at', sa.DateTime(), nullable=True),
                sa.PrimaryKeyConstraint('id')
            ]
            op.create_table(tbl_name, *cols)
            op.create_index(f'ix_{tbl_name}_id', tbl_name, ['id'])
            op.create_index(f'ix_{tbl_name}_store_id', tbl_name, ['store_id'])
            op.create_index(f'ix_{tbl_name}_product_id', tbl_name, ['product_id'], unique=True)

    # 11. Dynamic Configuration Tables
    if 'store_type_product_fields' not in tables:
        op.create_table(
            'store_type_product_fields',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_type_code', sa.String(50), nullable=False),
            sa.Column('field_name', sa.String(100), nullable=False),
            sa.Column('field_label', sa.String(100), nullable=False),
            sa.Column('field_type', sa.String(50), server_default='text', nullable=False),
            sa.Column('is_required', sa.Boolean(), server_default=sa.text('0'), nullable=False),
            sa.Column('default_value', sa.String(255), nullable=True),
            sa.Column('placeholder', sa.String(255), nullable=True),
            sa.Column('help_text', sa.String(255), nullable=True),
            sa.Column('display_order', sa.Integer(), server_default='0', nullable=False),
            sa.Column('section', sa.String(50), server_default='store_details', nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_st_prod_fields_id', 'store_type_product_fields', ['id'])
        op.create_index('ix_st_prod_fields_code', 'store_type_product_fields', ['store_type_code'])

    if 'store_type_field_options' not in tables:
        op.create_table(
            'store_type_field_options',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('field_id', sa.Integer(), sa.ForeignKey('store_type_product_fields.id', ondelete='CASCADE'), nullable=False),
            sa.Column('option_label', sa.String(100), nullable=False),
            sa.Column('option_value', sa.String(100), nullable=False),
            sa.Column('display_order', sa.Integer(), server_default='0', nullable=False),
            sa.Column('is_default', sa.Boolean(), server_default=sa.text('0'), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_st_field_opts_id', 'store_type_field_options', ['id'])
        op.create_index('ix_st_field_opts_field_id', 'store_type_field_options', ['field_id'])


def downgrade() -> None:
    pass

