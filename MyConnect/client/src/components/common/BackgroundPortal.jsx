import React from "react";
import { createPortal } from "react-dom";
import PortalHeader from "./PortalHeader";

const BackgroundPortal = ({ children, open, title, onClose, className }) => {
  console.log("BackgroundPortal rendering");

  if (!open) return null;

  return createPortal(
    <div
      data-state={`${open} ? 'show : 'hide'`}
      className="profile-container absolute z-[1000] h-full w-full bg-[var(--portal-bg-color)] 
      data-[state=hide]:scale-0 data-[state=show]:scale-100"
    >
      <div
        data-state={`${open} ? 'show : 'hide'`}
        className={`${className} fixed left-[50%] top-[50%] z-[1000] flex w-[50%] translate-x-[-50%] translate-y-[-50%] 
        flex-col overflow-hidden rounded-2xl transition-all duration-500 data-[state=hide]:scale-0 data-[state=show]:scale-100`}
      >
        <PortalHeader title={title} onClose={onClose} />
        {children}
      </div>
    </div>,
    document.getElementById("home"),
  );
};

export default BackgroundPortal;
