import { useState, useEffect } from 'react';
import { cachedQuery, getCacheKey } from '../lib/queryCache';

interface UseCachedQueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  ttl?: number;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseCachedQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCachedQuery<T>({
  queryKey,
  queryFn,
  ttl = 300000,
  enabled = true,
  onSuccess,
  onError,
}: UseCachedQueryOptions<T>): UseCachedQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cacheKey = queryKey.join(':');

  const fetchData = async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await cachedQuery(cacheKey, queryFn, ttl);
      setData(result);

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);

      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [cacheKey, enabled]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

export function useCachedSupabaseQuery<T>({
  table,
  params,
  queryFn,
  ttl = 300000,
  enabled = true,
}: {
  table: string;
  params: Record<string, any>;
  queryFn: () => Promise<T>;
  ttl?: number;
  enabled?: boolean;
}): UseCachedQueryResult<T> {
  const queryKey = [table, getCacheKey(table, params)];

  return useCachedQuery({
    queryKey,
    queryFn,
    ttl,
    enabled,
  });
}
