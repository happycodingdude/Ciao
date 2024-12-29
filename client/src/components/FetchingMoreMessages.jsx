import React from "react";

const FetchingMoreMessages = (props) => {
  const { loading } = props;

  if (!loading) return;

  return (
    <div
      className="absolute top-[5%] z-[1000] flex h-0 w-full items-center justify-center bg-[var(--bg-color-thin)] tracking-[.5rem]
        [&>*]:text-2xl [&>*]:text-[var(--text-main-color)]"
    >
      <span style={{ "--i": 1 }} className="waving-text">
        .
      </span>
      <span style={{ "--i": 2 }} className="waving-text">
        .
      </span>
      <span style={{ "--i": 3 }} className="waving-text">
        .
      </span>
    </div>
  );
};

export default FetchingMoreMessages;
