import React, { forwardRef, MutableRefObject } from "react";
import { CustomContentEditableProps } from "../types";

const CustomContentEditable = forwardRef(
  (
    props: CustomContentEditableProps,
    ref: MutableRefObject<HTMLDivElement>,
  ) => {
    const { onKeyDown, onKeyUp, className } = props;

    return (
      <div
        ref={ref}
        // ref={ref}
        contentEditable={true}
        // data-text="Type something.."
        // aria-placeholder="Type something.."
        className={`${className ?? ""} hide-scrollbar w-full resize-none overflow-y-auto break-all outline-none 
        phone:max-h-[10rem] laptop:max-h-[7rem] laptop-lg:max-h-[10rem]`}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
      ></div>
    );
  },
);

export default CustomContentEditable;
