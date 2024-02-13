import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import PortalHeader from "./PortalHeader";

const BackgroundPortal = ({ children, open, title, onClose, className }) => {
  console.log("BackgroundPortal rendering");

  if (!open) return null;

  const refProfileContainer = useRef();

  useEffect(() => {
    showProfile();
  }, [open]);

  const showProfile = () => {
    refProfileContainer.current.setAttribute("data-state", "show");
  };

  return createPortal(
    <div
      ref={refProfileContainer}
      data-state="hide"
      className="profile-container absolute z-[1000] h-full w-full 
      bg-[#0000009c] data-[state=hide]:scale-0 data-[state=show]:scale-100"
    >
      <div
        className={`${className} fixed left-[50%] top-[50%] z-[1001] m-auto flex aspect-[3/2] 
      w-[50%] translate-x-[-50%] translate-y-[-50%] flex-col 
      overflow-hidden rounded-2xl`}
      >
        <PortalHeader title={title} onClose={onClose} />
        {children}
      </div>
    </div>,
    document.getElementById("home"),
  );
};

export default BackgroundPortal;
