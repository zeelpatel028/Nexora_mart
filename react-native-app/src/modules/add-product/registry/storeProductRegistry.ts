import React from 'react';
import { StoreTypeCode } from '../common/types';
import GroceryProductModule from '../grocery';
import ClothingProductModule from '../clothing';
import MedicalProductModule from '../medical';
import ElectronicsProductModule from '../electronics';
import PlasticProductModule from '../plastic';
import HandloomProductModule from '../handloom';
import FurnitureProductModule from '../furniture';
import AgroProductModule from '../agro';

export interface StoreProductModuleDescriptor {
  storeType: StoreTypeCode;
  displayName: string;
  AddProductScreen: React.ComponentType<any>;
  EditProductScreen: React.ComponentType<any>;
  service: any;
  icon?: string;
  description?: string;
}

/**
 * Central Store Product Registry.
 * Holds product modules for all 8 supported store types in Nexora Mart.
 */
class StoreProductRegistryManager {
  private registry: Map<StoreTypeCode, StoreProductModuleDescriptor> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    this.register(GroceryProductModule);
    this.register(ClothingProductModule);
    this.register(MedicalProductModule);
    this.register(ElectronicsProductModule);
    this.register(PlasticProductModule);
    this.register(HandloomProductModule);
    this.register(FurnitureProductModule);
    this.register(AgroProductModule);
  }

  /**
   * Register or override a store product module.
   * Enables plug-and-play addition of future store types without restructuring.
   */
  public register(moduleDescriptor: StoreProductModuleDescriptor): void {
    this.registry.set(moduleDescriptor.storeType, moduleDescriptor);
  }

  /**
   * Retrieve the module for a given canonical store type.
   */
  public get(storeType: StoreTypeCode): StoreProductModuleDescriptor {
    const mod = this.registry.get(storeType);
    if (!mod) {
      // Fallback gracefully to grocery
      return this.registry.get('grocery') || GroceryProductModule;
    }
    return mod;
  }

  /**
   * Get all registered store product modules.
   */
  public getAll(): StoreProductModuleDescriptor[] {
    return Array.from(this.registry.values());
  }

  /**
   * Check if a store type is registered.
   */
  public has(storeType: StoreTypeCode): boolean {
    return this.registry.has(storeType);
  }
}

export const StoreProductRegistry = new StoreProductRegistryManager();
export default StoreProductRegistry;

