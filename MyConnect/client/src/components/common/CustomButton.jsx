import React, { useRef } from "react";

const CustomButton = ({ title, className, onClick, processing }) => {
  const refButton = useRef();

  const handleClick = () => {
    onClick();
  };
  return (
    <div
      ref={refButton}
      data-process={processing ? "true" : "false"}
      className={`${className ?? ""} mx-auto h-[4.5rem] w-full cursor-pointer rounded-[.4rem] bg-gradient-to-r 
              from-pink-300 to-pink-400 bg-[size:200%] bg-[position:0%_0%] py-[1rem] text-center
              font-medium text-white shadow-[0_3px_3px_-2px_#d3adfb] 
              transition-all duration-300 
              hover:bg-[position:100%_100%] hover:shadow-[0_3px_10px_-2px_#cea1fd]                            
              data-[process=true]:w-[4.5rem]
              data-[process=true]:rounded-[50%]`}
      onClick={handleClick}
    >
      {processing ? <div className="fa fa-spinner fa-spin"></div> : title}
    </div>
  );
};
export default CustomButton;
