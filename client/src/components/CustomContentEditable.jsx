import React, { forwardRef } from "react";

const CustomContentEditable = forwardRef((props, ref) => {
  const { onKeyDown, onKeyUp, className } = props;

  return (
    <div
      ref={ref}
      // ref={ref}
      contentEditable={true}
      // data-text="Type something.."
      // aria-placeholder="Type something.."
      className={`${className ?? ""} hide-scrollbar w-full resize-none overflow-y-auto break-all outline-none laptop:max-h-[10rem]`}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    ></div>
  );
});

export default CustomContentEditable;
