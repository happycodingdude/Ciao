import React from "react";

const CustomButton = ({
  title,
  className,
  leadingClass,
  gradientWidth,
  gradientHeight,
  rounded,
  onClick,
  processing,
}) => {
  const handleClick = () => {
    onClick();
  };
  return (
    <div className={`${className} relative z-0 mx-auto w-full`}>
      <div
        data-process={processing}
        style={{
          // Default width and height for auth page
          "--width": `${gradientWidth ?? "102%"}`,
          "--height": `${gradientHeight ?? "112%"}`,
          "--rounded": `${rounded ?? "3rem"}`,
        }}
        className={`gradient-item relative cursor-pointer rounded-[2rem] bg-[var(--bg-color)] text-center font-medium text-[var(--text-main-color)]
          transition-all data-[process=true]:pointer-events-none`}
        onClick={handleClick}
      >
        {processing ? (
          <div
            className={`fa fa-spinner fa-spin ${leadingClass ?? "leading-[4rem]"}`}
          ></div>
        ) : (
          <span className={`${leadingClass ?? "leading-[4rem]"}`}>{title}</span>
        )}
      </div>
    </div>
  );
};
export default CustomButton;
