"""add_store_specific_product_tables

Revision ID: 4c5d6e7f8a9b
Revises: 3b4c5d6e7f8a
Create Date: 2026-11-11 20:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from decimal import Decimal

revision: str = '4c5d6e7f8a9b'
down_revision: Union[str, Sequence[str], None] = '3b4c5d6e7f8a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    tables = insp.get_table_names()

    # --- 1. SHARED TABLES ---
    if 'product_subcategories' not in tables:
        op.create_table(
            'product_subcategories',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id', ondelete='CASCADE'), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('name', sa.String(100), nullable=False),
            sa.Column('code', sa.String(50), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_product_subcategories_id', 'product_subcategories', ['id'])
        op.create_index('ix_product_subcategories_cat_id', 'product_subcategories', ['category_id'])
        op.create_index('ix_product_subcategories_store_id', 'product_subcategories', ['store_id'])

    if 'product_unit_conversions' not in tables:
        op.create_table(
            'product_unit_conversions',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('from_unit', sa.String(50), nullable=False),
            sa.Column('to_unit', sa.String(50), nullable=False),
            sa.Column('multiplier', sa.Numeric(12, 4), nullable=False),
            sa.Column('description', sa.String(200), nullable=True),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_product_unit_conversions_id', 'product_unit_conversions', ['id'])
        op.create_index('ix_product_unit_conversions_store_id', 'product_unit_conversions', ['store_id'])

    if 'warehouses' not in tables:
        op.create_table(
            'warehouses',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('name', sa.String(150), nullable=False),
            sa.Column('code', sa.String(50), nullable=True),
            sa.Column('address', sa.Text(), nullable=True),
            sa.Column('contact_person', sa.String(150), nullable=True),
            sa.Column('phone', sa.String(50), nullable=True),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_warehouses_id', 'warehouses', ['id'])
        op.create_index('ix_warehouses_store_id', 'warehouses', ['store_id'])

    if 'stock_locations' not in tables:
        op.create_table(
            'stock_locations',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('warehouse_id', sa.Integer(), sa.ForeignKey('warehouses.id', ondelete='SET NULL'), nullable=True),
            sa.Column('name', sa.String(100), nullable=False),
            sa.Column('rack_number', sa.String(50), nullable=True),
            sa.Column('shelf_number', sa.String(50), nullable=True),
            sa.Column('bin_number', sa.String(50), nullable=True),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_stock_locations_id', 'stock_locations', ['id'])
        op.create_index('ix_stock_locations_store_id', 'stock_locations', ['store_id'])

    if 'tax_rates' not in tables:
        op.create_table(
            'tax_rates',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=True),
            sa.Column('name', sa.String(100), nullable=False),
            sa.Column('rate', sa.Numeric(5, 2), nullable=False),
            sa.Column('cgst_rate', sa.Numeric(5, 2), default=0.0),
            sa.Column('sgst_rate', sa.Numeric(5, 2), default=0.0),
            sa.Column('igst_rate', sa.Numeric(5, 2), default=0.0),
            sa.Column('is_default', sa.Boolean(), default=False),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_tax_rates_id', 'tax_rates', ['id'])

    if 'hsn_codes' not in tables:
        op.create_table(
            'hsn_codes',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('code', sa.String(50), unique=True, nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('default_gst_rate', sa.Numeric(5, 2), default=18.0),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_hsn_codes_code', 'hsn_codes', ['code'])

    if 'inventory_transactions' not in tables:
        op.create_table(
            'inventory_transactions',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.String(36), nullable=False),
            sa.Column('variant_id', sa.String(36), nullable=True),
            sa.Column('batch_id', sa.String(36), nullable=True),
            sa.Column('transaction_type', sa.String(50), nullable=False),
            sa.Column('quantity', sa.Numeric(12, 3), nullable=False),
            sa.Column('unit', sa.String(50), default='pcs'),
            sa.Column('reference_type', sa.String(50), nullable=True),
            sa.Column('reference_id', sa.String(100), nullable=True),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_inventory_transactions_id', 'inventory_transactions', ['id'])
        op.create_index('ix_inventory_transactions_store_id', 'inventory_transactions', ['store_id'])
        op.create_index('ix_inventory_transactions_product_id', 'inventory_transactions', ['product_id'])

    # --- 2. GROCERY STORE TABLES ---
    if 'grocery_products' not in tables:
        op.create_table(
            'grocery_products',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id', ondelete='SET NULL'), nullable=True),
            sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True),
            sa.Column('brand_id', sa.Integer(), sa.ForeignKey('brands.id', ondelete='SET NULL'), nullable=True),
            sa.Column('product_name', sa.String(255), nullable=False),
            sa.Column('product_code', sa.String(100), nullable=True),
            sa.Column('sku', sa.String(100), nullable=True),
            sa.Column('barcode', sa.String(100), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('food_type', sa.String(50), default='Vegetarian'),
            sa.Column('item_type', sa.String(100), nullable=True),
            sa.Column('packaging_type', sa.String(100), nullable=True),
            sa.Column('net_weight', sa.String(50), nullable=True),
            sa.Column('gross_weight', sa.String(50), nullable=True),
            sa.Column('shelf_life_days', sa.Integer(), nullable=True),
            sa.Column('is_vegetarian', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('storage_type', sa.String(100), default='Cool & Dry Place'),
            sa.Column('fssai_license', sa.String(100), nullable=True),
            sa.Column('status', sa.String(50), server_default='active', nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.Column('deleted_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_grocery_products_id', 'grocery_products', ['id'])
        op.create_index('ix_grocery_products_store_id', 'grocery_products', ['store_id'])
        op.create_index('ix_grocery_products_sku', 'grocery_products', ['sku'])

    if 'grocery_product_details_v2' not in tables:
        op.create_table(
            'grocery_product_details_v2',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('grocery_product_id', sa.String(36), sa.ForeignKey('grocery_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('ingredients', sa.Text(), nullable=True),
            sa.Column('nutritional_info', sa.Text(), nullable=True),
            sa.Column('allergen_info', sa.Text(), nullable=True),
            sa.Column('country_of_origin', sa.String(100), default='India'),
            sa.Column('manufacturer', sa.String(200), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('grocery_product_id')
        )

    if 'grocery_product_batches_v2' not in tables:
        op.create_table(
            'grocery_product_batches_v2',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('grocery_product_id', sa.String(36), sa.ForeignKey('grocery_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('batch_number', sa.String(100), nullable=False),
            sa.Column('manufacturing_date', sa.DateTime(), nullable=True),
            sa.Column('expiry_date', sa.DateTime(), nullable=True),
            sa.Column('purchase_price', sa.Numeric(12, 2), default=0.0),
            sa.Column('selling_price', sa.Numeric(12, 2), default=0.0),
            sa.Column('current_quantity', sa.Numeric(12, 3), default=0.0),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    # --- 3. CLOTHING STORE TABLES ---
    if 'clothing_products' not in tables:
        op.create_table(
            'clothing_products',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id', ondelete='SET NULL'), nullable=True),
            sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True),
            sa.Column('brand_id', sa.Integer(), sa.ForeignKey('brands.id', ondelete='SET NULL'), nullable=True),
            sa.Column('product_name', sa.String(255), nullable=False),
            sa.Column('product_code', sa.String(100), nullable=True),
            sa.Column('sku', sa.String(100), nullable=True),
            sa.Column('barcode', sa.String(100), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('gender', sa.String(50), default='Men'),
            sa.Column('clothing_type', sa.String(100), default='T-Shirt'),
            sa.Column('fabric_type', sa.String(100), default='Cotton'),
            sa.Column('pattern', sa.String(100), default='Plain'),
            sa.Column('fit_type', sa.String(100), default='Regular Fit'),
            sa.Column('sleeve_type', sa.String(100), nullable=True),
            sa.Column('neck_type', sa.String(100), nullable=True),
            sa.Column('occasion', sa.String(100), default='Casual'),
            sa.Column('season', sa.String(100), default='All Season'),
            sa.Column('country_of_origin', sa.String(100), default='India'),
            sa.Column('status', sa.String(50), server_default='active', nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.Column('deleted_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_clothing_products_id', 'clothing_products', ['id'])
        op.create_index('ix_clothing_products_store_id', 'clothing_products', ['store_id'])
        op.create_index('ix_clothing_products_sku', 'clothing_products', ['sku'])

    if 'clothing_product_details_v2' not in tables:
        op.create_table(
            'clothing_product_details_v2',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('clothing_product_id', sa.String(36), sa.ForeignKey('clothing_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('chest', sa.String(50), nullable=True),
            sa.Column('waist', sa.String(50), nullable=True),
            sa.Column('shoulder', sa.String(50), nullable=True),
            sa.Column('sleeve_length', sa.String(50), nullable=True),
            sa.Column('shirt_length', sa.String(50), nullable=True),
            sa.Column('hip', sa.String(50), nullable=True),
            sa.Column('inseam', sa.String(50), nullable=True),
            sa.Column('measurement_unit', sa.String(20), default='Inches'),
            sa.Column('care_instructions', sa.Text(), nullable=True),
            sa.Column('wash_type', sa.String(100), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('clothing_product_id')
        )

    if 'clothing_product_variants_v2' not in tables:
        op.create_table(
            'clothing_product_variants_v2',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('clothing_product_id', sa.String(36), sa.ForeignKey('clothing_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('size', sa.String(50), nullable=False),
            sa.Column('color', sa.String(50), nullable=False),
            sa.Column('sku', sa.String(100), nullable=True),
            sa.Column('barcode', sa.String(100), nullable=True),
            sa.Column('stock_quantity', sa.Numeric(12, 3), default=0.0),
            sa.Column('purchase_price', sa.Numeric(12, 2), default=0.0),
            sa.Column('selling_price', sa.Numeric(12, 2), default=0.0),
            sa.Column('mrp', sa.Numeric(12, 2), nullable=True),
            sa.Column('wholesale_price', sa.Numeric(12, 2), nullable=True),
            sa.Column('min_stock_alert', sa.Numeric(12, 3), default=3.0),
            sa.Column('variant_image_url', sa.String(500), nullable=True),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_clothing_variants_sku', 'clothing_product_variants_v2', ['sku'])

    # --- 4. MEDICAL STORE TABLES ---
    if 'medical_products' not in tables:
        op.create_table(
            'medical_products',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id', ondelete='SET NULL'), nullable=True),
            sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True),
            sa.Column('brand_id', sa.Integer(), sa.ForeignKey('brands.id', ondelete='SET NULL'), nullable=True),
            sa.Column('product_name', sa.String(255), nullable=False),
            sa.Column('generic_name', sa.String(255), nullable=True),
            sa.Column('product_code', sa.String(100), nullable=True),
            sa.Column('sku', sa.String(100), nullable=True),
            sa.Column('barcode', sa.String(100), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('medicine_type', sa.String(100), default='Prescription Medicine'),
            sa.Column('composition', sa.Text(), nullable=True),
            sa.Column('strength', sa.String(100), nullable=True),
            sa.Column('strength_unit', sa.String(50), default='mg'),
            sa.Column('dosage_form', sa.String(100), default='Tablet'),
            sa.Column('route_of_administration', sa.String(100), default='Oral'),
            sa.Column('prescription_required', sa.Boolean(), default=False),
            sa.Column('schedule_type', sa.String(50), default='Schedule H'),
            sa.Column('therapeutic_category', sa.String(150), nullable=True),
            sa.Column('drug_license_number', sa.String(100), nullable=True),
            sa.Column('storage_condition', sa.String(200), default='Cool & Dry Place'),
            sa.Column('status', sa.String(50), server_default='active', nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.Column('deleted_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_medical_products_id', 'medical_products', ['id'])
        op.create_index('ix_medical_products_store_id', 'medical_products', ['store_id'])
        op.create_index('ix_medical_products_sku', 'medical_products', ['sku'])

    if 'medical_product_details_v2' not in tables:
        op.create_table(
            'medical_product_details_v2',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('medical_product_id', sa.String(36), sa.ForeignKey('medical_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('pack_size', sa.String(100), nullable=True),
            sa.Column('strips_per_box', sa.Integer(), default=10),
            sa.Column('tablets_per_strip', sa.Integer(), default=10),
            sa.Column('side_effects', sa.Text(), nullable=True),
            sa.Column('precautions', sa.Text(), nullable=True),
            sa.Column('temperature_range', sa.String(100), nullable=True),
            sa.Column('keep_refrigerated', sa.Boolean(), default=False),
            sa.Column('light_sensitive', sa.Boolean(), default=False),
            sa.Column('manufacturer', sa.String(200), nullable=True),
            sa.Column('country_of_origin', sa.String(100), default='India'),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('medical_product_id')
        )

    if 'medical_product_batches_v2' not in tables:
        op.create_table(
            'medical_product_batches_v2',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('medical_product_id', sa.String(36), sa.ForeignKey('medical_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('batch_number', sa.String(100), nullable=False),
            sa.Column('manufacturing_date', sa.DateTime(), nullable=True),
            sa.Column('expiry_date', sa.DateTime(), nullable=False),
            sa.Column('purchase_price', sa.Numeric(12, 2), default=0.0),
            sa.Column('selling_price', sa.Numeric(12, 2), default=0.0),
            sa.Column('mrp', sa.Numeric(12, 2), nullable=True),
            sa.Column('initial_quantity', sa.Numeric(12, 3), default=0.0),
            sa.Column('current_quantity', sa.Numeric(12, 3), default=0.0),
            sa.Column('rack_location', sa.String(100), nullable=True),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_medical_batches_batch_no', 'medical_product_batches_v2', ['batch_number'])

    # --- 5. ELECTRONICS STORE TABLES ---
    if 'electronics_products' not in tables:
        op.create_table(
            'electronics_products',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id', ondelete='SET NULL'), nullable=True),
            sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True),
            sa.Column('brand_id', sa.Integer(), sa.ForeignKey('brands.id', ondelete='SET NULL'), nullable=True),
            sa.Column('product_name', sa.String(255), nullable=False),
            sa.Column('product_code', sa.String(100), nullable=True),
            sa.Column('sku', sa.String(100), nullable=True),
            sa.Column('barcode', sa.String(100), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('device_type', sa.String(100), default='Smartphone'),
            sa.Column('model_number', sa.String(100), nullable=True),
            sa.Column('model_name', sa.String(150), nullable=True),
            sa.Column('color', sa.String(50), nullable=True),
            sa.Column('ram', sa.String(50), nullable=True),
            sa.Column('storage_capacity', sa.String(50), nullable=True),
            sa.Column('processor', sa.String(150), nullable=True),
            sa.Column('screen_size', sa.String(50), nullable=True),
            sa.Column('battery_capacity', sa.String(50), nullable=True),
            sa.Column('connectivity', sa.String(150), nullable=True),
            sa.Column('warranty_months', sa.Integer(), default=12),
            sa.Column('warranty_type', sa.String(100), default='Brand Carry-In'),
            sa.Column('status', sa.String(50), server_default='active', nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.Column('deleted_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_electronics_products_id', 'electronics_products', ['id'])
        op.create_index('ix_electronics_products_store_id', 'electronics_products', ['store_id'])

    if 'electronics_product_details_v2' not in tables:
        op.create_table(
            'electronics_product_details_v2',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('electronics_product_id', sa.String(36), sa.ForeignKey('electronics_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('power_rating', sa.String(100), nullable=True),
            sa.Column('accessories_included', sa.Text(), nullable=True),
            sa.Column('operating_system', sa.String(100), nullable=True),
            sa.Column('camera_specs', sa.String(200), nullable=True),
            sa.Column('manufacturer', sa.String(200), nullable=True),
            sa.Column('country_of_origin', sa.String(100), default='India'),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('electronics_product_id')
        )

    if 'electronics_product_serials_v2' not in tables:
        op.create_table(
            'electronics_product_serials_v2',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('electronics_product_id', sa.String(36), sa.ForeignKey('electronics_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('serial_number', sa.String(100), nullable=False),
            sa.Column('imei_number', sa.String(100), nullable=True),
            sa.Column('status', sa.String(50), default='available'),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    # --- 6. PLASTIC STORE TABLES ---
    if 'plastic_products' not in tables:
        op.create_table(
            'plastic_products',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id', ondelete='SET NULL'), nullable=True),
            sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True),
            sa.Column('brand_id', sa.Integer(), sa.ForeignKey('brands.id', ondelete='SET NULL'), nullable=True),
            sa.Column('product_name', sa.String(255), nullable=False),
            sa.Column('product_code', sa.String(100), nullable=True),
            sa.Column('sku', sa.String(100), nullable=True),
            sa.Column('barcode', sa.String(100), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('plastic_type', sa.String(100), default='Polypropylene (PP)'),
            sa.Column('material_grade', sa.String(100), default='100% Virgin Grade'),
            sa.Column('color', sa.String(50), nullable=True),
            sa.Column('shape', sa.String(50), default='Round'),
            sa.Column('capacity', sa.String(50), nullable=True),
            sa.Column('capacity_unit', sa.String(50), default='L'),
            sa.Column('length', sa.String(50), nullable=True),
            sa.Column('width', sa.String(50), nullable=True),
            sa.Column('height', sa.String(50), nullable=True),
            sa.Column('thickness', sa.String(50), nullable=True),
            sa.Column('weight', sa.String(50), nullable=True),
            sa.Column('food_grade', sa.Boolean(), default=False),
            sa.Column('recyclable', sa.Boolean(), default=True),
            sa.Column('uv_resistant', sa.Boolean(), default=False),
            sa.Column('status', sa.String(50), server_default='active', nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.Column('deleted_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_plastic_products_id', 'plastic_products', ['id'])
        op.create_index('ix_plastic_products_store_id', 'plastic_products', ['store_id'])

    if 'plastic_product_details_v2' not in tables:
        op.create_table(
            'plastic_product_details_v2',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('plastic_product_id', sa.String(36), sa.ForeignKey('plastic_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('handle_type', sa.String(100), nullable=True),
            sa.Column('cap_type', sa.String(100), nullable=True),
            sa.Column('temperature_tolerance', sa.String(100), nullable=True),
            sa.Column('load_capacity', sa.String(50), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('plastic_product_id')
        )

    if 'plastic_product_variants_v2' not in tables:
        op.create_table(
            'plastic_product_variants_v2',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('plastic_product_id', sa.String(36), sa.ForeignKey('plastic_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('color', sa.String(50), nullable=True),
            sa.Column('capacity', sa.String(50), nullable=True),
            sa.Column('size', sa.String(50), nullable=True),
            sa.Column('sku', sa.String(100), nullable=True),
            sa.Column('barcode', sa.String(100), nullable=True),
            sa.Column('purchase_price', sa.Numeric(12, 2), default=0.0),
            sa.Column('selling_price', sa.Numeric(12, 2), default=0.0),
            sa.Column('stock_quantity', sa.Numeric(12, 3), default=0.0),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    # --- 7. HANDLOOM STORE TABLES ---
    if 'handloom_products' not in tables:
        op.create_table(
            'handloom_products',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id', ondelete='SET NULL'), nullable=True),
            sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True),
            sa.Column('brand_id', sa.Integer(), sa.ForeignKey('brands.id', ondelete='SET NULL'), nullable=True),
            sa.Column('product_name', sa.String(255), nullable=False),
            sa.Column('product_code', sa.String(100), nullable=True),
            sa.Column('sku', sa.String(100), nullable=True),
            sa.Column('barcode', sa.String(100), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('product_type', sa.String(100), default='Saree'),
            sa.Column('fabric_type', sa.String(100), default='Pure Khadi Cotton'),
            sa.Column('weaving_technique', sa.String(100), default='Traditional Pit Loom'),
            sa.Column('craft_type', sa.String(100), default='Zari Brocade'),
            sa.Column('material', sa.String(150), nullable=True),
            sa.Column('design_pattern', sa.String(100), default='Traditional'),
            sa.Column('origin_region', sa.String(150), nullable=True),
            sa.Column('artisan_name', sa.String(150), nullable=True),
            sa.Column('handwoven', sa.Boolean(), default=True),
            sa.Column('status', sa.String(50), server_default='active', nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.Column('deleted_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_handloom_products_id', 'handloom_products', ['id'])
        op.create_index('ix_handloom_products_store_id', 'handloom_products', ['store_id'])

    if 'handloom_product_details_v2' not in tables:
        op.create_table(
            'handloom_product_details_v2',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('handloom_product_id', sa.String(36), sa.ForeignKey('handloom_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('saree_length', sa.String(50), nullable=True),
            sa.Column('saree_width', sa.String(50), nullable=True),
            sa.Column('blouse_piece_included', sa.Boolean(), default=True),
            sa.Column('blouse_piece_length', sa.String(50), nullable=True),
            sa.Column('bedsheet_size', sa.String(50), nullable=True),
            sa.Column('pillow_covers_count', sa.Integer(), default=2),
            sa.Column('thread_count', sa.String(50), nullable=True),
            sa.Column('care_instructions', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('handloom_product_id')
        )

    if 'handloom_product_variants_v2' not in tables:
        op.create_table(
            'handloom_product_variants_v2',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('handloom_product_id', sa.String(36), sa.ForeignKey('handloom_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('color', sa.String(50), nullable=True),
            sa.Column('size', sa.String(50), nullable=True),
            sa.Column('pattern', sa.String(100), nullable=True),
            sa.Column('sku', sa.String(100), nullable=True),
            sa.Column('barcode', sa.String(100), nullable=True),
            sa.Column('purchase_price', sa.Numeric(12, 2), default=0.0),
            sa.Column('selling_price', sa.Numeric(12, 2), default=0.0),
            sa.Column('stock_quantity', sa.Numeric(12, 3), default=0.0),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    # --- 8. FURNITURE STORE TABLES ---
    if 'furniture_products' not in tables:
        op.create_table(
            'furniture_products',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id', ondelete='SET NULL'), nullable=True),
            sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True),
            sa.Column('brand_id', sa.Integer(), sa.ForeignKey('brands.id', ondelete='SET NULL'), nullable=True),
            sa.Column('product_name', sa.String(255), nullable=False),
            sa.Column('product_code', sa.String(100), nullable=True),
            sa.Column('sku', sa.String(100), nullable=True),
            sa.Column('barcode', sa.String(100), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('furniture_type', sa.String(100), default='Sofa & Couch'),
            sa.Column('material', sa.String(100), default='Solid Teak Wood'),
            sa.Column('wood_type', sa.String(100), nullable=True),
            sa.Column('finish_type', sa.String(100), default='Walnut Finish'),
            sa.Column('color', sa.String(50), nullable=True),
            sa.Column('seating_capacity', sa.Integer(), nullable=True),
            sa.Column('length', sa.String(50), nullable=True),
            sa.Column('width', sa.String(50), nullable=True),
            sa.Column('height', sa.String(50), nullable=True),
            sa.Column('dimension_unit', sa.String(20), default='inch'),
            sa.Column('weight', sa.String(50), nullable=True),
            sa.Column('weight_unit', sa.String(20), default='kg'),
            sa.Column('assembly_required', sa.Boolean(), default=False),
            sa.Column('storage_available', sa.Boolean(), default=False),
            sa.Column('warranty_period', sa.Integer(), default=36),
            sa.Column('warranty_unit', sa.String(20), default='Months'),
            sa.Column('status', sa.String(50), server_default='active', nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.Column('deleted_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_furniture_products_id', 'furniture_products', ['id'])
        op.create_index('ix_furniture_products_store_id', 'furniture_products', ['store_id'])

    if 'furniture_product_details_v2' not in tables:
        op.create_table(
            'furniture_product_details_v2',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('furniture_product_id', sa.String(36), sa.ForeignKey('furniture_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('upholstery_material', sa.String(100), nullable=True),
            sa.Column('frame_material', sa.String(100), nullable=True),
            sa.Column('number_of_doors', sa.Integer(), nullable=True),
            sa.Column('number_of_drawers', sa.Integer(), nullable=True),
            sa.Column('number_of_shelves', sa.Integer(), nullable=True),
            sa.Column('foldable', sa.Boolean(), default=False),
            sa.Column('care_instructions', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('furniture_product_id')
        )

    if 'furniture_product_variants_v2' not in tables:
        op.create_table(
            'furniture_product_variants_v2',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('furniture_product_id', sa.String(36), sa.ForeignKey('furniture_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('color', sa.String(50), nullable=True),
            sa.Column('size', sa.String(50), nullable=True),
            sa.Column('finish', sa.String(50), nullable=True),
            sa.Column('sku', sa.String(100), nullable=True),
            sa.Column('barcode', sa.String(100), nullable=True),
            sa.Column('purchase_price', sa.Numeric(12, 2), default=0.0),
            sa.Column('selling_price', sa.Numeric(12, 2), default=0.0),
            sa.Column('stock_quantity', sa.Numeric(12, 3), default=0.0),
            sa.Column('is_active', sa.Boolean(), server_default=sa.text('1'), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )

    # --- 9. AGRO STORE TABLES ---
    if 'agro_products' not in tables:
        op.create_table(
            'agro_products',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('store_id', sa.Integer(), sa.ForeignKey('stores.id', ondelete='CASCADE'), nullable=False),
            sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id', ondelete='SET NULL'), nullable=True),
            sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True),
            sa.Column('brand_id', sa.Integer(), sa.ForeignKey('brands.id', ondelete='SET NULL'), nullable=True),
            sa.Column('product_name', sa.String(255), nullable=False),
            sa.Column('product_code', sa.String(100), nullable=True),
            sa.Column('sku', sa.String(100), nullable=True),
            sa.Column('barcode', sa.String(100), nullable=True),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('agro_product_type', sa.String(50), default='Crop Medicine'),
            sa.Column('status', sa.String(50), server_default='active', nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.Column('deleted_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_agro_products_id', 'agro_products', ['id'])
        op.create_index('ix_agro_products_store_id', 'agro_products', ['store_id'])

    if 'agro_medicine_details' not in tables:
        op.create_table(
            'agro_medicine_details',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('agro_product_id', sa.String(36), sa.ForeignKey('agro_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('medicine_type', sa.String(100), default='Insecticide'),
            sa.Column('active_ingredient', sa.String(200), nullable=True),
            sa.Column('chemical_composition', sa.Text(), nullable=True),
            sa.Column('concentration', sa.String(100), nullable=True),
            sa.Column('formulation_type', sa.String(50), default='EC'),
            sa.Column('target_pest', sa.String(200), nullable=True),
            sa.Column('suitable_crops', sa.String(255), nullable=True),
            sa.Column('application_method', sa.String(100), default='Spray'),
            sa.Column('recommended_dosage', sa.String(100), nullable=True),
            sa.Column('dosage_unit', sa.String(50), default='ml / Litre'),
            sa.Column('waiting_period_phi', sa.String(50), nullable=True),
            sa.Column('re_entry_interval', sa.String(50), nullable=True),
            sa.Column('toxicity_class', sa.String(50), nullable=True),
            sa.Column('registration_number', sa.String(100), nullable=True),
            sa.Column('label_instructions', sa.Text(), nullable=True),
            sa.Column('safety_instructions', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('agro_product_id')
        )

    if 'agro_crop_details' not in tables:
        op.create_table(
            'agro_crop_details',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('agro_product_id', sa.String(36), sa.ForeignKey('agro_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('crop_category', sa.String(100), default='Cereals'),
            sa.Column('crop_variety', sa.String(150), nullable=True),
            sa.Column('crop_season', sa.String(50), default='Kharif'),
            sa.Column('crop_duration', sa.String(50), nullable=True),
            sa.Column('growing_region', sa.String(150), nullable=True),
            sa.Column('grade', sa.String(50), default='Grade A'),
            sa.Column('moisture_content', sa.String(50), nullable=True),
            sa.Column('organic_certified', sa.Boolean(), default=False),
            sa.Column('harvest_year', sa.String(20), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('agro_product_id')
        )

    if 'agro_fertilizer_details' not in tables:
        op.create_table(
            'agro_fertilizer_details',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('agro_product_id', sa.String(36), sa.ForeignKey('agro_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('fertilizer_type', sa.String(100), default='Chemical Fertilizer'),
            sa.Column('nitrogen_pct', sa.Numeric(5, 2), default=0.0),
            sa.Column('phosphorus_pct', sa.Numeric(5, 2), default=0.0),
            sa.Column('potassium_pct', sa.Numeric(5, 2), default=0.0),
            sa.Column('sulphur_pct', sa.Numeric(5, 2), default=0.0),
            sa.Column('zinc_pct', sa.Numeric(5, 2), default=0.0),
            sa.Column('boron_pct', sa.Numeric(5, 2), default=0.0),
            sa.Column('physical_form', sa.String(50), default='Granules'),
            sa.Column('application_method', sa.String(100), default='Soil Application'),
            sa.Column('suitable_crops', sa.String(255), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('agro_product_id')
        )

    if 'agro_seed_details' not in tables:
        op.create_table(
            'agro_seed_details',
            sa.Column('id', sa.String(36), nullable=False),
            sa.Column('agro_product_id', sa.String(36), sa.ForeignKey('agro_products.id', ondelete='CASCADE'), nullable=False),
            sa.Column('seed_type', sa.String(100), default='Vegetable Seeds'),
            sa.Column('crop_name', sa.String(150), nullable=True),
            sa.Column('seed_variety', sa.String(150), nullable=True),
            sa.Column('hybrid_type', sa.String(50), default='Hybrid'),
            sa.Column('seed_class', sa.String(50), default='Certified Seed'),
            sa.Column('germination_rate', sa.Numeric(5, 2), default=85.0),
            sa.Column('physical_purity', sa.Numeric(5, 2), default=98.0),
            sa.Column('genetic_purity', sa.Numeric(5, 2), default=99.0),
            sa.Column('seed_certification_number', sa.String(100), nullable=True),
            sa.Column('lot_number', sa.String(100), nullable=True),
            sa.Column('days_to_maturity', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('agro_product_id')
        )


def downgrade() -> None:
    pass

