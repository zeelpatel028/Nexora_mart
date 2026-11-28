import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiClient from '../../api/apiClient';
import Endpoints from '../../api/endpoints';
import { resolveCanonicalStoreType, StoreTypeCode } from '../storeResolver';

interface StoreContextType {
  store: any | null;
  currentStore: any | null;
  storeType: StoreTypeCode;
  isLoading: boolean;
  refreshStore: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType>({
  store: null,
  currentStore: null,
  storeType: 'grocery',
  isLoading: false,
  refreshStore: async () => {},
});

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [store, setStore] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchStore = async () => {
    if (!isAuthenticated) {
      setStore(null);
      return;
    }
    try {
      setIsLoading(true);
      const res = await apiClient.get<any>(Endpoints.STORES.MY_STORE);
      setStore(res);
    } catch (err) {
      console.warn('Error fetching store context:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, [isAuthenticated, user?.id]);

  const rawStoreType =
    store?.store_type_code ||
    (typeof store?.store_type === 'string'
      ? store.store_type
      : store?.store_type?.code || store?.store_type?.name) ||
    (user as any)?.shop_category ||
    user?.store_type ||
    (user as any)?.storeType ||
    'grocery';

  const storeType = resolveCanonicalStoreType(String(rawStoreType));

  return (
    <StoreContext.Provider
      value={{
        store,
        currentStore: store,
        storeType,
        isLoading,
        refreshStore: fetchStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
export default StoreContext;
