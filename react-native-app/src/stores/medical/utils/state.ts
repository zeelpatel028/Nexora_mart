import { useState, useEffect } from 'react';

export function create<T>(
  stateCreator: (
    set: (updater: Partial<T> | ((prev: T) => Partial<T>)) => void,
    get: () => T
  ) => T
) {
  let state: T;
  const listeners = new Set<(s: T) => void>();

  const get = () => state;
  const set = (updater: any) => {
    const next = typeof updater === 'function' ? updater(state) : updater;
    state = { ...state, ...next };
    listeners.forEach(fn => fn(state));
  };

  state = stateCreator(set, get);

  const useStore = (selector?: (s: T) => any) => {
    const [slice, setSlice] = useState(() => (selector ? selector(state) : state));
    useEffect(() => {
      const listener = (newS: T) => setSlice(selector ? selector(newS) : newS);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }, [selector]);
    return slice;
  };

  Object.assign(useStore, { getState: get, setState: set });
  return useStore as any;
}
