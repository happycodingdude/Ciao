import React from "react";

const CustomButton = ({ title, className, onClick, processing }) => {
  const handleClick = () => {
    onClick();
  };
  return (
    <div
      data-process={processing}
      // className={`${className ?? ""} mx-auto flex h-[4rem] w-full cursor-pointer items-center justify-center gap-2 rounded-[.4rem] bg-gradient-to-r
      //         from-[var(--main-color-normal)] to-[var(--main-color)] bg-[size:200%] bg-[position:0%_0%] py-[1rem] text-center
      //         font-medium text-[var(--text-sub-color)] shadow-[0_3px_3px_-2px_var(--main-color-normal)] transition-all duration-300
      //         hover:bg-[position:100%_100%] hover:shadow-[0_3px_10px_-2px_var(--main-color-normal)]
      //         data-[process=true]:pointer-events-none`}

      // className={`${className ?? ""}  mx-auto flex h-[4rem] w-full cursor-pointer items-center justify-center gap-2 rounded-[.4rem]
      //   border-[.2rem] border-[var(--main-color)] bg-[var(--bg-color-bold)] py-[1rem]
      //   text-center font-medium text-[var(--text-main-color)] transition-all duration-300
      //   hover:-translate-y-1 hover:shadow-[0_15px_10px_-10px_var(--main-color)]
      //   data-[process=true]:pointer-events-none`}

      className={`${className ?? ""}  mx-auto flex h-[4rem] w-full cursor-pointer items-center justify-center gap-2 rounded-[.4rem]
        border-[.2rem] border-[var(--main-color)] bg-[var(--bg-color-bold)] py-[1rem]
        text-center font-medium text-[var(--text-main-color)] transition-all duration-300
        data-[process=true]:pointer-events-none`}
      onClick={handleClick}
    >
      {processing ? (
        <div className="fa fa-spinner fa-spin"></div>
      ) : (
        <span className="button-title font-sans">{title}</span>
      )}
    </div>
  );
};
export default CustomButton;
