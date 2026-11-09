# Nexora Mart — Store Types & Dynamic Schemas

This document provides a detailed technical reference for all eight supported store verticals in Nexora Mart, including their stable codes, dynamic schemas, units of measurement, validation rules, and sample JSON payloads.

---

## 1. Overview & Stable Codes

Nexora Mart decouples display names from internal business logic by using immutable **stable codes**.

| # | Display Name | Stable Code | Primary Measurement Units | Allow Variants |
|---|--------------|-------------|---------------------------|----------------|
| 1 | Grocery Store | `grocery` | `kg`, `g`, `pack`, `pcs`, `liter`, `ml`, `box` | No |
| 2 | Clothing Store | `clothing` | `pcs`, `pair`, `set`, `meter` | Yes |
| 3 | Medical / Pharmacy Store | `medical` | `strip`, `bottle`, `box`, `vial`, `tube`, `tablet` | No |
| 4 | Mobile & Electronics Store | `mobile_electronics` | `pcs`, `box`, `set` | No |
| 5 | Plastic Store | `plastic` | `pcs`, `dozen`, `pack`, `kg`, `set` | No |
| 6 | Handloom Store | `handloom` | `meter`, `pcs`, `pair`, `set`, `yard` | Yes |
| 7 | Furniture Store | `furniture` | `pcs`, `set` | No |
| 8 | Agro Store | `agro` | `kg`, `liter`, `pack`, `bag`, `quintal`, `bottle` | No |

---

## 2. Store-Type Specifications & Schemas

### 2.1. Grocery Store (`grocery`)
- **Domain**: Supermarkets, FMCG, organic food, daily staples, packaged provisions.
- **Attributes**:
  - `batch_number` (`string`, optional): Manufacturer lot identifier.
  - `expiry_date` (`string` YYYY-MM-DD, optional): Shelf life limit date.
  - `fssai_license` (`string`, optional): Food safety registration number.
  - `is_organic` (`boolean`, optional, default `false`): Certified organic flag.
- **Validation Rules**:
  - If `expiry_date` is provided, it must match format `YYYY-MM-DD`.
- **Sample Payload**:
  ```json
  {
    "name": "Organic Whole Wheat Flour 5kg",
    "selling_price": 6.99,
    "purchase_price": 4.50,
    "unit": "pack",
    "attributes": {
      "batch_number": "WF-2026-04",
      "expiry_date": "2027-04-30",
      "fssai_license": "10020042000123",
      "is_organic": true
    }
  }
  ```

---

### 2.2. Clothing Store (`clothing`)
- **Domain**: Ready-made garments, fashion apparel, boutiquewares, footwear.
- **Attributes**:
  - `brand` (`string`, required): Designer or clothing manufacturer label.
  - `size` (`string`, optional, select: `XS`, `S`, `M`, `L`, `XL`, `XXL`, `Free Size`).
  - `color` (`string`, optional): Color hue / style name.
  - `fabric` (`string`, optional): e.g. `100% Cotton`, `Denim`, `Linen`, `Silk`.
  - `gender` (`string`, optional, select: `Men`, `Women`, `Unisex`, `Kids`, `Boys`, `Girls`).
- **Validation Rules**:
  - `brand` is strictly mandatory.
- **Sample Payload**:
  ```json
  {
    "name": "Slim Fit Oxford Cotton Shirt",
    "selling_price": 29.99,
    "purchase_price": 14.00,
    "unit": "pcs",
    "has_variants": true,
    "attributes": {
      "brand": "Nexora Apparel",
      "size": "L",
      "color": "Navy Blue",
      "fabric": "100% Egyptian Cotton",
      "gender": "Men"
    }
  }
  ```

---

### 2.3. Medical / Pharmacy Store (`medical`)
- **Domain**: Chemists, dispensaries, pharmacies, surgical supplies.
- **Attributes**:
  - `generic_name` (`string`, required): Active pharmaceutical ingredient.
  - `dosage_form` (`string`, optional, select: `Tablet`, `Capsule`, `Syrup`, `Injection`, `Ointment`, `Drops`).
  - `strength` (`string`, optional): e.g. `500mg`, `250mg/5ml`, `10mg`.
  - `manufacturer` (`string`, optional): Pharma producer.
  - `batch_number` (`string`, optional): Pharma control lot.
  - `expiry_date` (`string` YYYY-MM-DD, optional): Drug expiry.
  - `requires_prescription` (`boolean`, optional, default `false`): Schedule H/Rx drug indicator.
- **Validation Rules**:
  - `generic_name` is mandatory for clinical safety and cross-substitution.
- **Sample Payload**:
  ```json
  {
    "name": "Amoxicillin 500mg Capsules",
    "selling_price": 12.50,
    "purchase_price": 6.80,
    "unit": "strip",
    "attributes": {
      "generic_name": "Amoxicillin Trihydrate",
      "dosage_form": "Capsule",
      "strength": "500mg",
      "manufacturer": "BioHealth Labs",
      "batch_number": "AMX-8921",
      "expiry_date": "2027-11-30",
      "requires_prescription": true
    }
  }
  ```

---

### 2.4. Mobile & Electronics Store (`mobile_electronics`)
- **Domain**: Smartphones, computers, audio systems, smart wearables, electronics accessories.
- **Attributes**:
  - `brand` (`string`, required): Hardware manufacturer (Apple, Samsung, Sony, etc.).
  - `model` (`string`, required): Exact model name or number.
  - `warranty_months` (`number`, optional, default `12`): Manufacturer warranty duration.
  - `imei_serial` (`string`, optional): Unique device identifier / IMEI.
  - `ram_rom` (`string`, optional): e.g. `8GB / 256GB`.
  - `color` (`string`, optional): Device color finish.
- **Validation Rules**:
  - Both `brand` and `model` are mandatory.
- **Sample Payload**:
  ```json
  {
    "name": "Galaxy Ultra Pro 5G",
    "selling_price": 899.00,
    "purchase_price": 750.00,
    "unit": "pcs",
    "attributes": {
      "brand": "Samsung",
      "model": "SM-S928B",
      "warranty_months": 24,
      "imei_serial": "358921092831415",
      "ram_rom": "12GB / 512GB",
      "color": "Titanium Gray"
    }
  }
  ```

---

### 2.5. Plastic Store (`plastic`)
- **Domain**: Household plasticware, storage containers, industrial bins, polythene packaging.
- **Attributes**:
  - `plastic_type` (`string`, required, select: `PP (Polypropylene)`, `HDPE`, `LDPE`, `PET`, `PVC`, `Polycarbonate`, `Other`).
  - `capacity_volume` (`string`, optional): e.g. `20 Liters`, `500 ml`.
  - `size_dimensions` (`string`, optional): e.g. `40cm x 30cm x 25cm`.
  - `color` (`string`, optional): Plastic tint or shade.
  - `is_food_grade` (`boolean`, optional, default `false`): Certified safe for food contact.
- **Validation Rules**:
  - `plastic_type` is mandatory.
- **Sample Payload**:
  ```json
  {
    "name": "Airtight Food Storage Container 25L",
    "selling_price": 14.50,
    "purchase_price": 8.00,
    "unit": "pcs",
    "attributes": {
      "plastic_type": "PP (Polypropylene)",
      "capacity_volume": "25 Liters",
      "size_dimensions": "35x25x40 cm",
      "color": "Clear Translucent",
      "is_food_grade": true
    }
  }
  ```

---

### 2.6. Handloom Store (`handloom`)
- **Domain**: Artisan woven textiles, traditional sarees, shawls, handmade upholstery.
- **Attributes**:
  - `fabric_type` (`string`, required): e.g. `Tussar Silk`, `Khadi Cotton`, `Chanderi`, `Pashmina`.
  - `weave_technique` (`string`, optional): e.g. `Jacquard`, `Ikat`, `Brocade`, `Plain Weave`.
  - `pattern` (`string`, optional): e.g. `Floral Paisley`, `Geometric`, `Traditional Border`.
  - `artisan_region` (`string`, optional): Geographic origin (e.g. `Varanasi`, `Pochampally`, `Kashmir`).
  - `dimensions` (`string`, optional): e.g. `5.5m Saree with 0.8m Blouse`.
- **Validation Rules**:
  - `fabric_type` is mandatory.
- **Sample Payload**:
  ```json
  {
    "name": "Handcrafted Pure Banarasi Silk Saree",
    "selling_price": 180.00,
    "purchase_price": 110.00,
    "unit": "pcs",
    "attributes": {
      "fabric_type": "Katan Silk",
      "weave_technique": "Kadwa Brocade",
      "pattern": "Zari Floral Buta",
      "artisan_region": "Varanasi",
      "dimensions": "6.3 meters"
    }
  }
  ```

---

### 2.7. Furniture Store (`furniture`)
- **Domain**: Domestic and commercial furniture, solid wood, modular and upholstered fittings.
- **Attributes**:
  - `material` (`string`, required, select: `Solid Teak Wood`, `Sheesham Wood`, `Engineered Wood`, `Metal / Steel`, `Leatherette`, `Fabric / Foam`).
  - `dimensions` (`string`, optional): e.g. `78"L x 60"W x 36"H`.
  - `finish` (`string`, optional): e.g. `Matte Walnut`, `Gloss Mahogany`, `Powder Coated Black`.
  - `room_type` (`string`, optional, select: `Living Room`, `Bedroom`, `Dining Room`, `Office`, `Outdoor`).
  - `assembly_required` (`boolean`, optional, default `false`): Knock-down furniture requiring assembly.
  - `warranty_years` (`number`, optional, default `1`): Structural warranty period.
- **Validation Rules**:
  - `material` is mandatory.
- **Sample Payload**:
  ```json
  {
    "name": "Solid Sheesham 6-Seater Dining Table",
    "selling_price": 450.00,
    "purchase_price": 280.00,
    "unit": "set",
    "attributes": {
      "material": "Sheesham Wood",
      "dimensions": "72\" x 36\" x 30\"",
      "finish": "Natural Honey Matte",
      "room_type": "Dining Room",
      "assembly_required": true,
      "warranty_years": 5
    }
  }
  ```

---

### 2.8. Agro Store (`agro`)
- **Domain**: Agricultural supplies, certified seeds, crop nutrients, fertilizers, pesticides.
- **Attributes**:
  - `crop_category` (`string`, required, select: `Cereals & Grains`, `Pulses & Legumes`, `Vegetables`, `Oilseeds`, `Fertilizers`, `Pesticides / Insecticides`).
  - `seed_variety` (`string`, optional): Hybrid or pureline name (e.g. `Pusa Basmati 1509`).
  - `active_ingredient` (`string`, optional): Chemical component for agro-chemicals.
  - `batch_number` (`string`, optional): Lot tracking.
  - `expiry_date` (`string` YYYY-MM-DD, optional): Seed germination or chemical efficacy expiry.
  - `npk_ratio` (`string`, optional): Nitrogen-Phosphorus-Potassium ratio (e.g. `19:19:19`).
- **Validation Rules**:
  - `crop_category` is mandatory.
- **Sample Payload**:
  ```json
  {
    "name": "Water Soluble NPK Fertilizer 1kg",
    "selling_price": 8.50,
    "purchase_price": 5.20,
    "unit": "pack",
    "attributes": {
      "crop_category": "Fertilizers",
      "active_ingredient": "Water Soluble NPK Complex",
      "npk_ratio": "19:19:19",
      "batch_number": "NPK-2026-B9",
      "expiry_date": "2029-06-30"
    }
  }
  ```

---

## 3. Extensibility Guide: Adding a 9th Store Type

To introduce a new vertical (e.g. `footwear` or `jewelry`):
1. **Database**: Insert a new record in `store_types` (`code: 'jewelry', name: 'Jewelry Store'`).
2. **Backend**:
   - Create `backend/app/store_types/jewelry.py` inheriting from `BaseStoreType`.
   - Register it in `backend/app/store_types/registry.py`.
3. **Frontend**:
   - Create `react-native-app/src/storeTypes/jewelry.ts` implementing `StoreTypeConfig`.
   - Add it to `react-native-app/src/storeTypes/index.ts`.
4. No database migrations or schema adjustments are needed due to the dynamic JSON attribute architecture.

