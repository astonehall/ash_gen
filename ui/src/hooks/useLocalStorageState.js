import { useEffect, useState } from "react";

export function useLocalStorageState(key, initialValue, validate) {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const stored = window.localStorage.getItem(key);
      if (!stored) {
        return initialValue;
      }

      const parsed = JSON.parse(stored);
      if (validate && !validate(parsed)) {
        return initialValue;
      }

      return parsed;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
