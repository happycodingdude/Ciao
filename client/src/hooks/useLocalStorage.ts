import { useEffect, useState } from "react";

const useLocalStorage = (key: string) => {
  const [value, setValue] = useState<string | null>(() => {
    return localStorage.getItem(key);
  });
  useEffect(() => {
    if (!value) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }, [key, value]);
  return [value, setValue];
};

export default useLocalStorage;
