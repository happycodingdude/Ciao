import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const BackgroundPortal = ({ children, open }) => {
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
      className="profile-container absolute z-[1000] h-full w-full bg-[#0000009c] 
        data-[state=hide]:scale-0 data-[state=show]:scale-100"
    >
      <div className="fixed left-[50%] top-[50%] z-[1001] aspect-[3/2] w-[50%] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl">
        {children}
      </div>
    </div>,
    document.getElementById("home"),
  );
};

export default BackgroundPortal;
