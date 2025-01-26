import React from "react";

const OnlineStatusDot = (props) => {
  const { online, className } = props;

  return (
    <div
      className={`${className} absolute aspect-square w-[1rem] rounded-[50%] 
      ${online ? "bg-[var(--online-color)]" : "bg-[var(--offline-color)]"}`}
    ></div>
  );
};

export default OnlineStatusDot;
