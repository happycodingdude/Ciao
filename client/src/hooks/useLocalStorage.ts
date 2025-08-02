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
  initialValue?: T,
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

// const useLocalStorage = <T>(
//   key: string,
//   initialValue?: T,
// ): [T, (value: T) => void] => {
//   const getStoredValue = (): T => {
//     if (typeof window === "undefined") return initialValue as T;

//     const storedValue = localStorage.getItem(key);
//     if (storedValue === null) return initialValue as T;

//     try {
//       return JSON.parse(storedValue) as T;
//     } catch {
//       return storedValue as unknown as T;
//     }
//   };

//   const [value, setValue] = useState<T>(getStoredValue);

//   const setStoredValue = (val: T) => {
//     try {
//       setValue(val);

//       if (val === undefined || val === null) {
//         localStorage.removeItem(key);
//       } else {
//         localStorage.setItem(key, JSON.stringify(val));
//       }

//       // Notify others in this tab
//       window.dispatchEvent(
//         new CustomEvent("localstorage-changed", { detail: { key } }),
//       );
//     } catch (error) {
//       console.warn(`Error setting localStorage key “${key}”:`, error);
//     }
//   };

//   useEffect(() => {
//     const handleStorage = (event: StorageEvent | CustomEvent) => {
//       const changedKey =
//         event instanceof StorageEvent
//           ? event.key
//           : (event as CustomEvent).detail.key;

//       if (changedKey === key) {
//         setValue(getStoredValue());
//       }
//     };

//     window.addEventListener("storage", handleStorage);
//     window.addEventListener(
//       "localstorage-changed",
//       handleStorage as EventListener,
//     );

//     return () => {
//       window.removeEventListener("storage", handleStorage);
//       window.removeEventListener(
//         "localstorage-changed",
//         handleStorage as EventListener,
//       );
//     };
//   }, [key]);

//   return [value, setStoredValue];
// };

export default useLocalStorage;
