import React, { CSSProperties } from "react";
import { CustomButtonProps } from "../types";

const CustomButton = (props: CustomButtonProps) => {
  const {
    title,
    className,
    padding,
    gradientWidth,
    gradientHeight,
    rounded,
    onClick,
    processing,
    width,
  } = props;
  const handleClick = () => {
    onClick();
  };
  return (
    <div
      className={`${className} relative z-0 mx-auto ${width ? `w-[${width}rem]` : "w-full"}`}
    >
      <div
        data-process={processing}
        style={
          {
            // Default width and height for auth page
            // "--width": `${gradientWidth ?? "102%"}`,
            // "--height": `${gradientHeight ?? "117%"}`,
            // "--rounded": `${rounded ?? "3rem"}`,
            "--width": `${gradientWidth}`,
            "--height": `${gradientHeight}`,
            "--rounded": `${rounded}`,
          } as CSSProperties
        }
        className={`gradient-item relative cursor-pointer rounded-[2rem] bg-[var(--bg-color)] text-center font-medium 
          transition-all data-[process=true]:pointer-events-none`}
        onClick={(e) => {
          e.stopPropagation(); // Prevent bubbling to parent
          handleClick();
        }}
        // onClick={handleClick}
      >
        {processing ? (
          <div
            className={`fa fa-spinner fa-spin leading-[2rem] ${padding ?? "py-[1rem]"}`}
          ></div>
        ) : (
          <span className={`leading-[2rem] ${padding ?? "py-[1rem]"}`}>
            {title}
          </span>
          // <span className={``}>{title}</span>
        )}
      </div>
    </div>
  );
};
export default CustomButton;
