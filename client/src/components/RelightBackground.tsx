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
      ${paddingClassName ?? "phone:p-[.5rem] laptop:p-[1rem]"}
      ${lighten ? "bg-[var(--main-color)] text-[var(--sub-color)]" : "bg-[var(--bg-color-thin)]"}`}
      // className={`${className}
      // ${lighten ? "rounded-[1rem] bg-[var(--main-color-light)] text-[var(--text-sub-color)]" : "rounded-[50%] bg-[var(--bg-color-extrathin)] text-[var(--text-main-color)]"}
      // flex aspect-square cursor-pointer items-center
      // justify-center p-[1rem]
      // transition-all duration-200 hover:rounded-[1rem]
      // hover:bg-[var(--main-color-light)]`}

      onClick={onClick ?? (() => {})}
    >
      {children}
    </div>
  );
};

export default RelightBackground;
