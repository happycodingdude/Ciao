import React from "react";

const CustomButton = ({
  title,
  className,
  leadingClass,
  gradientClass,
  onClick,
  processing,
}) => {
  const handleClick = () => {
    onClick();
  };
  return (
    // <div
    //   className={`${className} mx-auto w-full rounded-[2rem] bg-gradient-to-tr from-[var(--main-color)] to-[var(--main-color-extrathin)] p-[.3rem]`}
    // >
    //   <div
    //     data-process={processing}
    //     className={`h-full w-full cursor-pointer rounded-[2rem] bg-[var(--bg-color)] text-center
    //     font-medium text-[var(--text-main-color)] transition-all duration-300
    //     data-[process=true]:pointer-events-none`}
    //     onClick={handleClick}
    //   >
    //     {processing ? (
    //       <div
    //         className={`fa fa-spinner fa-spin ${leadingClass ?? "leading-[4rem]"}`}
    //       ></div>
    //     ) : (
    //       <span
    //         className={`button-title font-sans ${leadingClass ?? "leading-[4rem]"}`}
    //       >
    //         {title}
    //       </span>
    //     )}
    //   </div>
    // </div>

    // <div
    //   data-process={processing}
    //   className={`${className} relative mx-auto flex w-full cursor-pointer items-center justify-center
    //     rounded-[2rem] bg-[var(--bg-color)] text-center font-medium text-[var(--text-main-color)]
    //     transition-all duration-300 after:absolute after:z-[-1]
    //     after:h-[115%] after:w-[102%] after:rounded-[3rem] after:bg-gradient-to-tr
    //     after:from-[var(--main-color)] after:to-[var(--main-color-extrathin)] data-[process=true]:pointer-events-none`}
    //   onClick={handleClick}
    // >
    //   {processing ? (
    //     <div
    //       className={`fa fa-spinner fa-spin ${leadingClass ?? "leading-[4rem]"}`}
    //     ></div>
    //   ) : (
    //     <span className={`${leadingClass ?? "leading-[4rem]"}`}>{title}</span>
    //   )}
    // </div>
    <div className={`${className} relative z-0 mx-auto w-full`}>
      <div
        data-process={processing}
        className={`relative flex cursor-pointer items-center justify-center rounded-[2rem] bg-[var(--bg-color)] text-center
        font-medium text-[var(--text-main-color)] transition-all
        duration-300 after:absolute after:z-[-1] after:rounded-[3rem_3rem]
        ${gradientClass ?? "after:h-[112%] after:w-[102%]"}
        after:box-border after:bg-gradient-to-tr
        after:from-[var(--main-color)] after:to-[var(--main-color-extrathin)] data-[process=true]:pointer-events-none`}
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
