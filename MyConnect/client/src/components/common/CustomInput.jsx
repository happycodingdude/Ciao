import { Tooltip } from "antd";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef
} from "react";

const CustomInput = forwardRef(
  ({ type, value, label, error, onChange, onKeyDown }, ref) => {
    const refInput = useRef();
    const refPlaceHolder = useRef();
    const refBorder = useRef();
    // const refError = useRef();

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

    // useEffect(() => {
    //   if(error === undefined)
    //     refError.current?.setAttribute("data-error", "false");
    //   else
    //   refError.current?.setAttribute("data-error", "true");
    // },[error])

    return (
      <div className="relative">
        <input
          className="w-[99%] border-[.1rem] border-[var(--sub-color)] !border-b-[var(--border-color)] p-[1rem] outline-none 
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
          className="absolute bottom-0 h-[.1rem] w-full origin-left bg-[var(--main-color)] transition-all duration-200
          data-[focus=false]:scale-x-0 data-[focus=true]:scale-x-[0.99]"
        ></div>
        <p
          ref={refPlaceHolder}
          data-focus="false"
          className="pointer-events-none absolute left-[3%] top-[50%] z-10 origin-left transition-all duration-200 
          data-[focus=false]:translate-y-[-50%] data-[focus=true]:translate-y-[-170%]
          data-[focus=true]:scale-[.9] data-[focus=true]:bg-[var(--bg-color)] data-[focus=false]:text-[var(--text-main-color-blur)]
          data-[focus=true]:text-[var(--main-color)]
        "
        >
          {label}
        </p>
        <Tooltip title={error} color="var(--danger-text-color-light)">
        <div
        // ref={refError}
        // data-error={error === undefined ? 'false' : 'true'}
          className={`absolute right-[3%] top-[50%] fa fa-exclamation-triangle text-[var(--danger-text-color)] 
          ${error === undefined ? 'scale-y-0' : 'scale-y-100'}
          `}
        >
        </div>
        </Tooltip>
      </div>
    );
  },
);

export default CustomInput;
