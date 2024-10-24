import React from "react";

const OnlineStatusDot = (props) => {
  const { online } = props;

  return (
    <div
      className={`absolute bottom-0 right-[-10%] aspect-square w-[1rem] rounded-[50%] 
      ${online ? "bg-[var(--online-color)]" : "bg-[var(--offline-color)]"}`}
    ></div>
  );
};

export default OnlineStatusDot;
