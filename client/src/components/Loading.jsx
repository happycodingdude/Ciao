import React from "react";

const Loading = () => {
  return (
    <div
      className="absolute z-[1000] flex h-full w-full items-center justify-center bg-[var(--loading-color)] tracking-[.5rem] 
    [&>*]:text-[clamp(2.3rem,1.2vw,3rem)] [&>*]:text-[var(--text-main-color)]"
    >
      <span style={{ "--i": 1 }} className="waving-text">
        L
      </span>
      <span style={{ "--i": 2 }} className="waving-text">
        o
      </span>
      <span style={{ "--i": 3 }} className="waving-text">
        a
      </span>
      <span style={{ "--i": 4 }} className="waving-text">
        d
      </span>
      <span style={{ "--i": 5 }} className="waving-text">
        i
      </span>
      <span style={{ "--i": 6 }} className="waving-text">
        n
      </span>
      <span style={{ "--i": 7 }} className="waving-text">
        g
      </span>
      <span style={{ "--i": 8 }} className="waving-text">
        .
      </span>
      <span style={{ "--i": 9 }} className="waving-text">
        .
      </span>
      <span style={{ "--i": 10 }} className="waving-text">
        .
      </span>
    </div>
  );
};

export default Loading;
