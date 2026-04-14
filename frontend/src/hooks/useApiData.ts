import { useEffect, useRef, useState, type DependencyList } from 'react';
import type { ApiMeta } from '../types/api';

type UseApiDataState<T> = {
  data: T | null;
  meta: ApiMeta | null;
  isLoading: boolean;
  error: string | null;
};

export function useApiData<T>(
  loader: () => Promise<{ data: T; meta: ApiMeta; error: { message: string } | null }>,
  deps: DependencyList
) {
  const loaderRef = useRef(loader);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const [state, setState] = useState<UseApiDataState<T>>({
    data: null,
    meta: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    loaderRef.current()
      .then((res) => {
        if (!mounted) {
          return;
        }

        setState({
          data: res.data,
          meta: res.meta,
          isLoading: false,
          error: res.error?.message ?? null
        });
      })
      .catch((err: unknown) => {
        if (!mounted) {
          return;
        }

        setState({
          data: null,
          meta: null,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load data'
        });
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  return state;
}
