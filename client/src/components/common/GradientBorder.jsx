import React from "react";

const GradientBorder = ({ children, className }) => {
  return (
    <div
      // className={`after:absolute after:z-[-1] after:rounded-[3rem_3rem]
      //   ${className ?? "after:h-[112%] after:w-[102%]"}
      //   after:box-border after:bg-gradient-to-tr
      //   after:from-[var(--main-color)] after:to-[var(--main-color-extrathin)]`}

      className="first:gradient-item"
    >
      {children}
    </div>
  );
};
export default GradientBorder;
