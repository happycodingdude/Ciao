import { useEffect, useRef } from "react";
import { EventListenerHook } from "../types";

const useEventListener: EventListenerHook<HTMLElement | Window> = (
  event,
  callback,
  element = window,
) => {
  const callbackRef = useRef<(event: Event) => void>(callback);

  // Update callbackRef on every render
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const targetElement: HTMLElement | Window = element ?? window;
    if (!targetElement || !(targetElement instanceof EventTarget)) return;

    const eventHandler = (event: Event) => callbackRef.current(event);
    targetElement.addEventListener(event, eventHandler, true);

    return () => {
      targetElement.removeEventListener(event, eventHandler, true);
    };
  }, [event, element]);
};

export default useEventListener;
