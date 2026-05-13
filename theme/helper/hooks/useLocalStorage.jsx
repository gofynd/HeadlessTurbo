import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue, callback) {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const value = JSON.parse(item);
        setStoredValue(value);
        callback?.(value);
      } else {
        callback?.()
      }
    } catch (error) {
      // SECURITY (report FND-36): surface parse failures so a poisoned
      // localStorage value does not silently substitute the default. Dev-only
      // to keep prod consoles clean for shoppers.
      if (process.env.NODE_ENV === "development") {
        console.warn(`useLocalStorage: parse error for key "${key}"`, error);
      }
    }
  }, []);

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`useLocalStorage: write error for key "${key}"`, error);
      }
    }
  };

  return [storedValue, setValue];
}
