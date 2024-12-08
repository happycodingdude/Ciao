import React from "react";

const LocalLoading = (props) => {
  const { sm, zindex } = props;
  return (
    <div
      class={`loading absolute flex h-full w-full items-center justify-center bg-[var(--loading-color)]
    ${sm ? "p-[1rem]" : ""}
    ${zindex ?? "z-10"}`}
    >
      <div class="loader">
        <svg class="circular" viewBox="25 25 50 50">
          <circle
            class="path"
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke-width="2"
            stroke-miterlimit="10"
          />
        </svg>
      </div>
    </div>
  );
};

export default LocalLoading;
