import { useEffect, useState } from "react";

const useLocalStorage = (key) => {
  const [value, setValue] = useState(() => {
    return localStorage.getItem(key);
  });
  useEffect(() => {
    if (!value) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }, [key, value]);
  return [value, setValue];
};

export default useLocalStorage;
