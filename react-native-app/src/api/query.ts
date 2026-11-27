import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry {
  data: any;
  updatedAt: number;
}

const queryCache = new Map<string, CacheEntry>();
const listeners = new Set<(prefixKey?: string) => void>();
const DEFAULT_STALE_TIME_MS = 15000;

function serializeKey(queryKey: any[]): string {
  try {
    return JSON.stringify(queryKey);
  } catch {
    return String(queryKey);
  }
}

export function useQuery<T>(options: {
  queryKey: any[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
}) {
  const keyStr = serializeKey(options.queryKey);
  const cached = queryCache.get(keyStr);
  const staleTime = options.staleTime ?? DEFAULT_STALE_TIME_MS;

  const [data, setData] = useState<T | undefined>(cached ? cached.data : undefined);
  const [isLoading, setIsLoading] = useState<boolean>(!cached && options.enabled !== false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);

  const queryFnRef = useRef(options.queryFn);
  queryFnRef.current = options.queryFn;

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (options.enabled === false) {
        setIsLoading(false);
        return;
      }
      const existing = queryCache.get(keyStr);
      if (isRefresh || existing) {
        setIsRefetching(true);
      } else {
        setIsLoading(true);
      }
      try {
        const res = await queryFnRef.current();
        queryCache.set(keyStr, { data: res, updatedAt: Date.now() });
        setData(res);
        setIsError(false);
      } catch (err) {
        setIsError(true);
        setError(err);
      } finally {
        setIsLoading(false);
        setIsRefetching(false);
      }
    },
    [keyStr, options.enabled]
  );

  useEffect(() => {
    const existing = queryCache.get(keyStr);
    if (existing) {
      setData(existing.data);
      setIsLoading(false);
      if (Date.now() - existing.updatedAt > staleTime) {
        fetchData(true);
      }
    } else {
      fetchData(false);
    }
  }, [keyStr, options.enabled, staleTime, fetchData]);

  useEffect(() => {
    const onInvalidate = (prefix?: string) => {
      if (!prefix || keyStr.includes(prefix)) {
        fetchData(true);
      }
    };
    listeners.add(onInvalidate);
    return () => {
      listeners.delete(onInvalidate);
    };
  }, [keyStr, fetchData]);

  return {
    data,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch: () => fetchData(true),
  };
}

export function useMutation<TData = any, TVariables = any>(options: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: any, variables: TVariables) => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutateAsync = async (variables: TVariables): Promise<TData> => {
    setIsPending(true);
    setError(null);
    try {
      const result = await options.mutationFn(variables);
      if (options.onSuccess) options.onSuccess(result, variables);
      return result;
    } catch (err) {
      setError(err);
      if (options.onError) options.onError(err, variables);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  const mutate = (variables: TVariables) => {
    mutateAsync(variables).catch(() => {});
  };

  return { mutate, mutateAsync, isPending, error };
}

export function clearQueryCache() {
  queryCache.clear();
  listeners.forEach((cb) => cb(undefined));
}

export function useQueryClient() {
  return {
    invalidateQueries: (filters?: { queryKey?: any[] }) => {
      const prefix = filters?.queryKey?.[0] ? String(filters.queryKey[0]) : undefined;
      if (prefix) {
        for (const k of Array.from(queryCache.keys())) {
          if (k.includes(prefix)) {
            queryCache.delete(k);
          }
        }
      } else {
        queryCache.clear();
      }
      listeners.forEach((cb) => cb(prefix));
    },
  };
}
