import { CSSProperties } from "react";
import { CustomButtonProps } from "../types";

const CustomButton = (props: CustomButtonProps) => {
  const {
    title,
    className,
    gradientWidth,
    gradientHeight,
    rounded,
    onClick,
    processing,
    width,
    height,
    top,
    sm,
  } = props;
  const handleClick = () => {
    onClick();
  };
  return (
    <div
      className={`${className} relative z-0 mx-auto ${width ? "shrink-0" : ""}`}
      style={{ width: width ? `${width}rem` : "100%" }}
    >
      <div
        data-process={processing}
        style={
          {
            "--width": `${gradientWidth}`,
            "--height": `${gradientHeight}`,
            "--rounded": `${rounded}`,
            "--top": `${top ?? "-2.6px"}`,
          } as CSSProperties
        }
        className={`gradient-item rounded-4xl bg-(--bg-color) relative ${sm ? "h-7" : "h-10"} cursor-pointer text-center font-medium 
          transition-all data-[process=true]:pointer-events-none`}
        onClick={(e) => {
          e.stopPropagation(); // Prevent bubbling to parent
          handleClick();
        }}
      >
        {processing ? (
          <div className={`fa fa-spinner fa-spin`}></div>
        ) : (
          <span>{title}</span>
        )}
      </div>
    </div>
  );
};
export default CustomButton;
