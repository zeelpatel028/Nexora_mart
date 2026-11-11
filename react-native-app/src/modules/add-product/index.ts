// Registry & Resolution
export * from './registry/storeProductRegistry';
export * from './registry/productModuleResolver';
export * from './registry/productRoutes';

// Shared Common Module
export * from './common';

// 8 Store-Specific Product Modules
export { default as GroceryProductModule } from './grocery';
export { default as ClothingProductModule } from './clothing';
export { default as MedicalProductModule } from './medical';
export { default as ElectronicsProductModule } from './electronics';
export { default as PlasticProductModule } from './plastic';
export { default as HandloomProductModule } from './handloom';
export { default as FurnitureProductModule } from './furniture';
export { default as AgroProductModule } from './agro';

