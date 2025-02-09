import { useEffect, useRef } from "react";
import { EventListenerHook } from "../types";

// const useEventListener = (event, callback, element = window) => {
//   if (!element || !element.addEventListener) return;
//   useEffect(() => {
//     element.addEventListener(event, callback, true);
//     return () => {
//       element.removeEventListener(event, callback, true);
//     };
//   }, [event, callback, element]);
// };

const useEventListener: EventListenerHook<HTMLElement | Window> = (
  event,
  callback,
  element = window,
) => {
  const callbackRef = useRef<(event: Event) => void>(callback);

  useEffect(() => {
    const targetElement: HTMLElement | Window = element ?? window;
    if (!targetElement || !(targetElement instanceof EventTarget)) return;

    const eventHandler = (event: Event) => callbackRef.current(event);
    targetElement.addEventListener(event, eventHandler);

    return () => {
      targetElement.removeEventListener(event, eventHandler);
    };
  }, [event, element]);
};

export default useEventListener;
