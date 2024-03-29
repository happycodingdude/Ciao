import React from "react";

const CustomButton = ({ title, className, onClick, processing }) => {
  const handleClick = () => {
    onClick();
  };
  return (
    <div
      data-process={processing ? "true" : "false"}
      className={`${className ?? ""} mx-auto flex h-[4rem] w-full cursor-pointer items-center rounded-[.4rem] bg-gradient-to-r 
              from-[var(--main-color-normal)] to-[var(--main-color)] bg-[size:200%] bg-[position:0%_0%] py-[1rem] text-center
              font-medium text-[var(--text-sub-color)] shadow-[0_3px_3px_-2px_var(--main-color-normal)] transition-all duration-300 
              hover:bg-[position:100%_100%] hover:shadow-[0_3px_10px_-2px_var(--main-color-normal)]                            
              data-[process=true]:w-[4.5rem]
              data-[process=true]:rounded-[50%]`}
      onClick={handleClick}
    >
      {processing ? (
        <div className="fa fa-spinner fa-spin"></div>
      ) : (
        <span className="button-title mx-auto">{title}</span>
      )}
    </div>
  );
};
export default CustomButton;
