import React, { useCallback } from "react";
import { createPortal } from "react-dom";
import useEventListener from "../hooks/useEventListener";
import { BackgroundPortalProps } from "../types";
import PortalHeader from "./PortalHeader";

const BackgroundPortal = (props: BackgroundPortalProps) => {
  // console.log("BackgroundPortal rendering");
  const { children, show, title, onClose, className, noHeader } = props;

  if (!show) return null;

  // Event listener
  const hidePortalOnClick = useCallback((e) => {
    if (Array.from(e.target.classList).includes("portal-container")) onClose();
  }, []);
  // useEventListener("click", hidePortalOnClick);
  const hidePortalOnKey = useCallback((e) => {
    if (e.keyCode === 27) {
      onClose();
    }
  }, []);
  useEventListener("keydown", hidePortalOnKey);

  return createPortal(
    <div
      data-show={`${show}`}
      className="portal-container absolute z-[1000] h-full w-full 
      bg-[var(--portal-bg-color)] data-[show=false]:scale-0 data-[state=true]:scale-100"
    >
      <div
        data-show={`${show}`}
        className={`${className} fixed left-[50%] top-[50%] z-[1000] flex w-[50%] translate-x-[-50%] translate-y-[-50%] 
        flex-col overflow-hidden rounded-2xl bg-[var(--bg-color)] transition-all duration-500
        data-[show=false]:scale-0 data-[show=true]:scale-100`}
      >
        {noHeader ? "" : <PortalHeader title={title} onClose={onClose} />}

        {children}
      </div>
    </div>,
    document.getElementById("portal"),
  );
};

export default BackgroundPortal;
