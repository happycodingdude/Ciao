import React from "react";

const CustomButton = ({ title, className, onClick }) => {
  return (
    <div
      className={`${className ?? ""} w-full cursor-pointer rounded-[.4rem] bg-gradient-to-r 
              from-purple-300 to-purple-400 bg-[size:200%] bg-[position:0%_0%] py-[1rem] text-center
              font-medium text-white shadow-[0_3px_3px_-2px_#d3adfb] 
              transition-all duration-500 
              hover:bg-[position:100%_100%] hover:shadow-[0_3px_10px_-2px_#cea1fd]`}
      onClick={onClick}
    >
      {title}
    </div>
  );
};

export default CustomButton;
