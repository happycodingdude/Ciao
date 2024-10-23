import React, { useCallback } from "react";
import { createPortal } from "react-dom";
import { useEventListener } from "../../hook/CustomHooks";
import PortalHeader from "./PortalHeader";

const BackgroundPortal = ({ children, show, title, onClose, className }) => {
  console.log("BackgroundPortal rendering");

  if (!show) return null;

  // Event listener
  const hidePortalOnClick = useCallback((e) => {
    if (Array.from(e.target.classList).includes("portal-container")) onClose();
  }, []);
  useEventListener("click", hidePortalOnClick);
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
        <PortalHeader title={title} onClose={onClose} />
        {children}
      </div>
    </div>,
    document.getElementById("root"),
  );
};

export default BackgroundPortal;
