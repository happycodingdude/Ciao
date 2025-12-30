import { CSSProperties } from "react";
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
      className={`${className} relative z-0 mx-auto`}
      style={{ width: width ? `${width}rem` : "100%" }}
    >
      <div
        data-process={processing}
        style={
          {
            "--width": `${gradientWidth}`,
            "--height": `${gradientHeight}`,
            "--rounded": `${rounded}`,
          } as CSSProperties
        }
        className={`gradient-item rounded-4xl bg-(--bg-color) relative cursor-pointer text-center font-medium 
          transition-all data-[process=true]:pointer-events-none`}
        onClick={(e) => {
          e.stopPropagation(); // Prevent bubbling to parent
          handleClick();
        }}
      >
        {processing ? (
          <div
            className={`fa fa-spinner fa-spin leading-8 ${padding ?? "py-4"}`}
          ></div>
        ) : (
          <span className={`leading-8 ${padding ?? "py-2"}`}>{title}</span>
        )}
      </div>
    </div>
  );
};
export default CustomButton;
