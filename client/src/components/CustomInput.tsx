import React, { useEffect, useRef } from "react";
import { CustomInputProps } from "../types";

const CustomInput = (props: CustomInputProps) => {
  const {
    type,
    label,
    inputRef,
    className,
    placeholder,
    tabIndex = -1,
    onKeyDown,
    onChange,
  } = props;

  const refPlaceHolder = useRef<HTMLParagraphElement>();
  const refBorder = useRef<HTMLDivElement>();

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement, Element>,
    focus?: boolean,
  ) => {
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
    inputRef.current.value = "";
    refPlaceHolder.current.setAttribute("data-focus", "false");
    refBorder.current.setAttribute("data-focus", "false");
  };

  useEffect(() => {
    if (!inputRef) return;
    inputRef.current.reset = resetInputEffectAndValue;
  }, [resetInputEffectAndValue]);

  return (
    <div className="relative">
      <input
        tabIndex={tabIndex}
        className={`${className ?? ""} border-(--bg-color) border-b-(--border-color)! w-[99%] border-[.1rem] 
        p-4 pb-[.2rem] pl-0 outline-none transition-all duration-200`}
        type={type}
        ref={inputRef}
        onFocus={(e) => handleFocus(e, true)}
        onBlur={(e) => handleFocus(e)}
        onKeyDown={onKeyDown}
        onChange={onChange}
        placeholder={placeholder}
      />
      <div
        ref={refBorder}
        data-focus="false"
        className="bg-(--light-blue-500) absolute bottom-0 h-0.5 w-full origin-left transition-all duration-200
          data-[focus=false]:scale-x-0 data-[focus=true]:scale-x-[0.99]"
      ></div>
      <p
        ref={refPlaceHolder}
        data-focus="false"
        className=" pointer-events-none absolute left-0 top-[50%] z-10 origin-left transition-all duration-200 
        data-[focus=false]:translate-y-[-50%] data-[focus=true]:translate-y-[-150%] data-[focus=true]:scale-[.9]"
      >
        {label}
      </p>
    </div>
  );
};

export default CustomInput;
