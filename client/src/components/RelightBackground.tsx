import React from "react";
import { RelightBackgroundProps } from "../types";

const RelightBackground = (props: RelightBackgroundProps) => {
  const {
    children,
    lighten,
    className,
    onClick,
    paddingClassName,
    ...restProps
  } = props;
  return (
    <div
      {...restProps}
      className={`${className ?? ""} flex aspect-square cursor-pointer items-center justify-center rounded-[1rem] 
      transition-all duration-200 hover:bg-[var(--main-color)] hover:text-[var(--sub-color)]
      ${paddingClassName ?? "p-[1rem]"}
      ${lighten ? "bg-[var(--main-color)] text-[var(--sub-color)]" : "bg-[var(--bg-color-thin)]"}`}
      onClick={onClick ?? (() => {})}
    >
      {children}
    </div>
  );
};

export default RelightBackground;
