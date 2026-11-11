import { AgroProductType } from '../types';

export const AGRO_PRODUCT_TYPE_OPTIONS: Array<{ label: string; value: AgroProductType; icon: string }> = [
  { label: 'Crop Medicine', value: 'Crop Medicine', icon: 'flask-outline' },
  { label: 'Crop / Produce', value: 'Crop', icon: 'nutrition-outline' },
  { label: 'Fertilizer & Nutrients', value: 'Fertilizer', icon: 'leaf-outline' },
  { label: 'Seeds & Planting', value: 'Seeds', icon: 'flower-outline' },
];

export const MEDICINE_TYPE_OPTIONS = [
  { label: 'Insecticide', value: 'Insecticide' },
  { label: 'Fungicide', value: 'Fungicide' },
  { label: 'Herbicide / Weedicide', value: 'Herbicide' },
  { label: 'Nematicide', value: 'Nematicide' },
  { label: 'Bio-Pesticide', value: 'Bio-Pesticide' },
  { label: 'Plant Growth Regulator (PGR)', value: 'Plant Growth Regulator' },
  { label: 'Bactericide', value: 'Bactericide' },
];

export const FORMULATION_OPTIONS = [
  { label: 'EC (Emulsifiable Concentrate)', value: 'EC' },
  { label: 'SC (Suspension Concentrate)', value: 'SC' },
  { label: 'WP (Wettable Powder)', value: 'WP' },
  { label: 'SP (Soluble Powder)', value: 'SP' },
  { label: 'SL (Soluble Liquid)', value: 'SL' },
  { label: 'GR (Granules)', value: 'GR' },
  { label: 'WG / WDG (Water Dispersible Granules)', value: 'WG' },
  { label: 'FS (Flowable Concentrate for Seed Treatment)', value: 'FS' },
];

export const TOXICITY_CLASSES = [
  { label: 'Green (Slightly Toxic)', value: 'Green - Slightly Toxic' },
  { label: 'Blue (Moderately Toxic)', value: 'Blue - Moderately Toxic' },
  { label: 'Yellow (Highly Toxic)', value: 'Yellow - Highly Toxic' },
  { label: 'Red (Extremely Toxic)', value: 'Red - Extremely Toxic' },
];

export const CROP_SEASONS = [
  { label: 'Kharif (Monsoon)', value: 'Kharif' },
  { label: 'Rabi (Winter)', value: 'Rabi' },
  { label: 'Zaid (Summer)', value: 'Zaid' },
  { label: 'All Season / Year-Round', value: 'All Season' },
];

export const FERTILIZER_TYPE_OPTIONS = [
  { label: 'Chemical / Synthetic Fertilizer', value: 'Chemical Fertilizer' },
  { label: 'Water Soluble Fertilizer (WSF)', value: 'Water Soluble Fertilizer' },
  { label: 'Organic Manure / Compost', value: 'Organic Fertilizer' },
  { label: 'Bio-Fertilizer (Rhizobium, PSB)', value: 'Bio-Fertilizer' },
  { label: 'Micronutrient Mixture', value: 'Micronutrient Mixture' },
  { label: 'Soil Conditioner / Humic Acid', value: 'Soil Conditioner' },
];

export const PHYSICAL_FORM_OPTIONS = [
  { label: 'Granules', value: 'Granules' },
  { label: 'Liquid', value: 'Liquid' },
  { label: 'Powder', value: 'Powder' },
  { label: 'Crystalline', value: 'Crystalline' },
  { label: 'Pellets', value: 'Pellets' },
];

export const SEED_CLASS_OPTIONS = [
  { label: 'Certified Seed (Blue Tag)', value: 'Certified Seed' },
  { label: 'Truthful Label Seed (Green Tag)', value: 'Truthful Seed' },
  { label: 'Foundation Seed (White Tag)', value: 'Foundation Seed' },
  { label: 'Breeder Seed (Yellow Tag)', value: 'Breeder Seed' },
  { label: 'Hybrid Seed', value: 'Hybrid Seed' },
];

export const SEED_TYPE_OPTIONS = [
  { label: 'Cereals & Grains', value: 'Cereals' },
  { label: 'Pulses & Legumes', value: 'Pulses' },
  { label: 'Oilseeds', value: 'Oilseeds' },
  { label: 'Vegetable Seeds', value: 'Vegetable Seeds' },
  { label: 'Fruit Seeds', value: 'Fruit Seeds' },
  { label: 'Fodder Crops', value: 'Fodder Crops' },
  { label: 'Fiber Crops (Cotton, Jute)', value: 'Fiber Crops' },
];

