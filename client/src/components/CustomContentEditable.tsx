import React, { forwardRef, MutableRefObject } from "react";
import { CustomContentEditableProps } from "../types";

const CustomContentEditable = forwardRef(
  (
    props: CustomContentEditableProps,
    ref: MutableRefObject<HTMLDivElement>,
  ) => {
    const { onKeyDown, onKeyUp, className } = props;
    // const localRef = useRef<HTMLDivElement>(null);
    // const [isEmpty, setIsEmpty] = useState(true);

    // const checkEmpty = useCallback(() => {
    //   const text = localRef.current?.innerText.trim() ?? "";
    //   setIsEmpty(text === "");
    // }, []);

    // useEffect(() => {
    //   checkEmpty();
    // }, [checkEmpty]);

    // // Gán ref từ cha vào localRef
    // useEffect(() => {
    //   if (!ref) return;
    //   ref.current = localRef.current;
    // }, [ref]);

    return (
      <div
        ref={ref}
        contentEditable={true}
        // data-text="Type something.."
        // aria-placeholder="Type something.."
        className={`${className ?? ""} hide-scrollbar relative w-full resize-none overflow-y-auto break-all 
        outline-none phone:max-h-[10rem] laptop:max-h-[7rem] laptop-lg:max-h-[10rem]`}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        // onKeyDown={(e) => {
        //   onKeyDown?.(e);
        //   setTimeout(checkEmpty, 0);
        // }}
        // onKeyUp={(e) => {
        //   onKeyUp?.(e);
        //   setTimeout(checkEmpty, 0);
        // }}
        // onInput={checkEmpty}
      >
        {props.isEmpty && (
          <span className="pointer-events-none absolute text-gray-400">
            Type your message here...
          </span>
        )}
        {/* <span className="pointer-events-none absolute left-2 text-gray-400">
          Type your message here...
        </span> */}
      </div>
    );
  },
);

export default CustomContentEditable;
