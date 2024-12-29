import { useEffect } from "react";

const useEventListener = (event, callback, element = window) => {
  if (!element || !element.addEventListener) return;
  useEffect(() => {
    element.addEventListener(event, callback, true);
    return () => {
      element.removeEventListener(event, callback, true);
    };
  }, [event, callback, element]);
};

export default useEventListener;
