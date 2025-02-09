// import { Tooltip } from "antd";
import React from "react";
import { Tooltip } from "react-tooltip";

const ErrorComponent = (props) => {
  const { error } = props;
  return (
    <div
      tabIndex={-1}
      className={`tooltip-wrapper relative h-[2rem] w-[2rem] ${error === "" ? "scale-0" : "scale-100"}`}
    >
      <div className="pulsing absolute h-[70%] w-[70%] rounded-[50%] border-[.1rem] border-red-500"></div>
      <i
        data-tooltip-id="error-tooltip"
        data-tooltip-html={error}
        className={`fa fa-exclamation-circle absolute translate-x-[-5%] translate-y-[-0.8%] text-[var(--danger-text-color)] `}
      ></i>
      <Tooltip
        id="error-tooltip"
        // style={{ backgroundColor: "rgb(0, 255, 30)", color: "#222" }}
        className="custom-tooltip"
      />
    </div>
  );
};

export default ErrorComponent;
