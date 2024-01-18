import React, { useEffect, useRef } from "react";

const CustomInput = ({ label, error, onChange }) => {
  const refInput = useRef("");
  const refPlaceHolder = useRef();
  const refBorder = useRef();
  const refError = useRef();

  const handleInputChange = () => {
    onChange(refInput.current.value);
  };

  const handleFocus = (e, focus) => {
    if (e.target.value !== "") return;
    if (focus === true) {
      e.target.classList.add("input-focus");
      refPlaceHolder.current.classList.add("input-focus-placeholder");
      refBorder.current.classList.add("input-focus-border");
    } else {
      e.target.classList.remove("input-focus");
      refPlaceHolder.current.classList.remove("input-focus-placeholder");
      refBorder.current.classList.remove("input-focus-border");
    }
  };

  useEffect(() => {
    refError.current.classList.remove("scale-x-0");
    refError.current.classList.add("scale-x-100");
  }, [error]);

  return (
    <div className="relative">
      <input
        className="focus w-full border-[.1rem] border-white !border-b-gray-300 px-[1rem] py-[1rem] 
outline-none transition-all duration-200"
        ref={refInput}
        type="text"
        onChange={handleInputChange}
        onFocus={(e) => handleFocus(e, true)}
        onBlur={(e) => handleFocus(e)}
      />
      <div
        ref={refBorder}
        className="absolute bottom-[1%] h-[.1rem] w-0 bg-purple-400 transition-all duration-200"
      ></div>
      <p
        ref={refPlaceHolder}
        className="pointer-events-none absolute left-[3%] top-[50%] z-10 origin-left translate-y-[-50%] text-gray-400 transition-all duration-200"
      >
        {label}
      </p>
      <p
        ref={refError}
        className="pointer-events-none absolute right-[3%] top-[50%] origin-right translate-y-[-50%] scale-x-0 overflow-hidden text-red-500 transition-all duration-200"
      >
        {error}
      </p>
    </div>
  );
};

export default CustomInput;
