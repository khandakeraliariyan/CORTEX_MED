"use client";

import { useCallback, useEffect, useState } from "react";

type SetStoredValue<T> = (value: T | ((prev: T) => T)) => void;

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [value: T, setValue: SetStoredValue<T>, isHydrated: boolean] {
  const [value, setValueState] = useState<T>(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(key);

    if (stored === null) {
      setValueState(defaultValue);
    } else {
      try {
        setValueState(JSON.parse(stored) as T);
      } catch {
        setValueState(defaultValue);
      }
    }

    setIsHydrated(true);
    // Only re-run when the storage key itself changes, not on every defaultValue reference change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback<SetStoredValue<T>>(
    (next) => {
      setValueState((prev) => {
        const resolved =
          typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
        window.localStorage.setItem(key, JSON.stringify(resolved));
        return resolved;
      });
    },
    [key]
  );

  return [value, setValue, isHydrated];
}
