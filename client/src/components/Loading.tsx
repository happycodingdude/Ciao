import React, { CSSProperties } from "react";

const Loading = () => {
  return (
    <div
      className="absolute z-[1000] flex h-full w-full items-center justify-center bg-[var(--loading-color)] tracking-[.5rem] 
    [&>*]:text-[clamp(2.3rem,1.2vw,3rem)] [&>*]:text-[var(--text-main-color)]"
    >
      <span style={{ "--i": 1 } as CSSProperties} className="waving-text">
        L
      </span>
      <span style={{ "--i": 2 } as CSSProperties} className="waving-text">
        o
      </span>
      <span style={{ "--i": 3 } as CSSProperties} className="waving-text">
        a
      </span>
      <span style={{ "--i": 4 } as CSSProperties} className="waving-text">
        d
      </span>
      <span style={{ "--i": 5 } as CSSProperties} className="waving-text">
        i
      </span>
      <span style={{ "--i": 6 } as CSSProperties} className="waving-text">
        n
      </span>
      <span style={{ "--i": 7 } as CSSProperties} className="waving-text">
        g
      </span>
      <span style={{ "--i": 8 } as CSSProperties} className="waving-text">
        .
      </span>
      <span style={{ "--i": 9 } as CSSProperties} className="waving-text">
        .
      </span>
      <span style={{ "--i": 10 } as CSSProperties} className="waving-text">
        .
      </span>
    </div>
  );
};

export default Loading;
