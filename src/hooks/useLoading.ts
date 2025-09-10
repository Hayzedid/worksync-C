import { useState, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useLoading = (initialLoading: boolean = false): LoadingState => {
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    // Clear error when starting new loading
    if (loading && error) {
      setError(null);
    }
  }, [error]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    setLoading,
    setError,
    clearError,
    reset
  };
};

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

export const useAsync = <T,>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate: boolean = false
): AsyncState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { data, isLoading, error, execute, reset };
};

// Hook for API calls with loading states
export const useApiCall = <T,>(
  apiFunction: (...args: any[]) => Promise<T>
) => {
  const {
    data,
    isLoading,
    error,
    execute,
    reset
  } = useAsync(apiFunction);

  const call = useCallback(
    async (...args: any[]) => {
      try {
        const result = await execute(...args);
        return { success: true, data: result };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
      }
    },
    [execute]
  );

  return {
    data,
    isLoading,
    error,
    call,
    reset
  };
};

// Multiple loading states manager
export const useMultipleLoading = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
    // Clear error when starting loading
    if (loading) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
  }, []);

  const setError = useCallback((key: string, error: string | null) => {
    setErrors(prev => ({ ...prev, [key]: error }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const getError = useCallback((key: string) => {
    return errors[key] || null;
  }, [errors]);

  const hasAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const clearError = useCallback((key: string) => {
    setErrors(prev => ({ ...prev, [key]: null }));
  }, []);

  const reset = useCallback((key?: string) => {
    if (key) {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
      setErrors(prev => ({ ...prev, [key]: null }));
    } else {
      setLoadingStates({});
      setErrors({});
    }
  }, []);

  return {
    setLoading,
    setError,
    isLoading,
    getError,
    hasAnyLoading,
    clearError,
    reset
  };
};
