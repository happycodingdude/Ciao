import { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";

export const useLocalStorage = (key) => {
  const [value, setValue] = useState(() => {
    return JSON.parse(localStorage.getItem(key));
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export const useEventListener = (event, callback, element = window) => {
  if (!element || !element.addEventListener) return;
  useEffect(() => {
    element.addEventListener(event, callback);
    return () => {
      element.removeEventListener(event, callback);
    };
  }, [event, callback, element]);
};
