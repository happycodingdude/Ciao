import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const ProfilePortal = ({ children, open }) => {
  console.log("ProfilePortal rendering");

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
      {children}
    </div>,
    document.getElementById("home"),
  );
};

export default ProfilePortal;
