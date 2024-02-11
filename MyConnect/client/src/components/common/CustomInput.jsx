import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const CustomInput = forwardRef(
  ({ type, value, label, error, onChange, onKeyDown }, ref) => {
    const refInput = useRef();
    const refPlaceHolder = useRef();
    const refBorder = useRef();
    const refError = useRef();

    useImperativeHandle(ref, () => ({
      reset() {
        refPlaceHolder.current.setAttribute("data-focus", "false");
        refBorder.current.setAttribute("data-focus", "false");
      },
    }));

    const handleInputChange = (e) => {
      if (onChange === undefined) return;
      onChange(e.target.value);
    };

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

    const toggleError = (error) => {
      if (error === "") {
        refError.current.classList.remove("scale-x-100");
        refError.current.classList.add("scale-x-0");
      } else {
        refError.current.classList.remove("scale-x-0");
        refError.current.classList.add("scale-x-100");
      }
    };

    useEffect(() => {
      toggleError(error);
    }, [error]);

    // useEffect(() => {
    //   if (value !== "") return;
    // }, [value]);

    return (
      <div className="relative">
        <input
          className="w-[99%] border-[.1rem] border-white !border-b-gray-300 p-[1rem] outline-none 
        transition-all duration-200"
          type={type}
          ref={refInput}
          value={value}
          onChange={handleInputChange}
          onFocus={(e) => handleFocus(e, true)}
          onBlur={(e) => handleFocus(e)}
          onKeyDown={onKeyDown}
        />
        <div
          ref={refBorder}
          data-focus="false"
          className="absolute bottom-0 h-[.1rem] w-full origin-left bg-pink-400 transition-all duration-200
        data-[focus=false]:scale-x-0 data-[focus=true]:scale-x-[0.99]"
        ></div>
        <p
          ref={refPlaceHolder}
          data-focus="false"
          className="pointer-events-none absolute left-[3%] top-[50%] z-10 origin-left 
        transition-all duration-200 
        data-[focus=false]:translate-y-[-50%] data-[focus=true]:translate-y-[-170%]
        data-[focus=true]:scale-[.9] data-[focus=true]:bg-white data-[focus=false]:text-gray-400 data-[focus=true]:text-pink-400
        "
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
  },
);

export default CustomInput;
