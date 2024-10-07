import React, { useEffect, useRef } from "react";

const CustomInput = (props) => {
  const { type, label, onKeyDown, reference, className, tabIndex = -1 } = props;
  const refPlaceHolder = useRef();
  const refBorder = useRef();

  const handleFocus = (e, focus) => {
    if (e.target.value !== "") return;
    if (focus === true) {
      refPlaceHolder.current.setAttribute("data-focus", "true");
      refBorder.current.setAttribute("data-focus", "true");
    } else {
      refPlaceHolder.current.setAttribute("data-focus", "false");
      refBorder.current.setAttribute("data-focus", "false");
    }
  };

  const resetInputEffectAndValue = () => {
    reference.current.value = "";
    refPlaceHolder.current.setAttribute("data-focus", "false");
    refBorder.current.setAttribute("data-focus", "false");
  };

  useEffect(() => {
    if (!reference) return;
    reference.current.reset = resetInputEffectAndValue;
  }, [resetInputEffectAndValue]);

  return (
    <div className="relative">
      <input
        tabIndex={tabIndex}
        className={`${className ?? ""} w-[99%] border-[.1rem] border-[var(--sub-color)] !border-b-[var(--border-color)] bg-[var(--bg-color)]
        p-[1rem] pb-[.2rem] pl-0 text-[var(--text-main-color)] outline-none
          transition-all duration-200`}
        // className={`${className ?? ""} w-[99%] border-[.1rem] border-[var(--sub-color)] !border-b-[var(--border-color)] p-[1rem] pb-[.2rem] pl-0 outline-none
        //   transition-all duration-200`}
        type={type}
        ref={reference}
        onFocus={(e) => handleFocus(e, true)}
        onBlur={(e) => handleFocus(e)}
        onKeyDown={onKeyDown}
      />
      <div
        ref={refBorder}
        data-focus="false"
        className="absolute bottom-0 h-[.1rem] w-full origin-left bg-[var(--main-color)] transition-all duration-200
          data-[focus=false]:scale-x-0 data-[focus=true]:scale-x-[0.99]"
      ></div>
      <p
        ref={refPlaceHolder}
        data-focus="false"
        className="pointer-events-none absolute left-0 top-[50%] z-10 origin-left transition-all duration-200 
          data-[focus=false]:translate-y-[-50%] data-[focus=true]:translate-y-[-150%]
          data-[focus=true]:scale-[.9] data-[focus=true]:bg-[var(--bg-color)] data-[focus=false]:text-[var(--text-main-color-normal)]
          data-[focus=true]:text-[var(--main-color)]
        "
      >
        {label}
      </p>
    </div>
  );
};

export default CustomInput;
