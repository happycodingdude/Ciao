import { useEffect, useState } from "react";

// Helper function to detect if a value is JSON
const isJSON = (value: string | null) => {
  if (!value) return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

const useLocalStorage = <T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);

    if (storedValue === null) return initialValue; // No stored value, use initial

    return isJSON(storedValue)
      ? (JSON.parse(storedValue) as T)
      : (storedValue as T);
  });

  useEffect(() => {
    if (value === undefined || value === null) {
      localStorage.removeItem(key);
    } else {
      const valueToStore =
        typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, valueToStore);
    }
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;
