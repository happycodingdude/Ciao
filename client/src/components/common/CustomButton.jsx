import React from "react";

const CustomButton = ({
  title,
  className,
  leadingClass,
  onClick,
  processing,
}) => {
  const handleClick = () => {
    onClick();
  };
  return (
    <div
      className={`${className} mx-auto w-full rounded-[.4rem] bg-gradient-to-tr from-[var(--main-color)] to-[var(--main-color-extrathin)] p-[.3rem]`}
    >
      <div
        data-process={processing}
        className={`h-full w-full cursor-pointer rounded-[.4rem] bg-[var(--bg-color)] text-center
        font-medium text-[var(--text-main-color)] transition-all duration-300
        data-[process=true]:pointer-events-none`}
        onClick={handleClick}
      >
        {processing ? (
          <div
            className={`fa fa-spinner fa-spin ${leadingClass ?? "leading-[4rem]"}`}
          ></div>
        ) : (
          <span
            className={`button-title font-sans ${leadingClass ?? "leading-[4rem]"}`}
          >
            {title}
          </span>
        )}
      </div>
    </div>
  );
};
export default CustomButton;
