import {
  ClipboardEvent,
  forwardRef,
  MutableRefObject,
  useCallback,
} from "react";
import { CustomContentEditableProps } from "../types";

const CustomContentEditable = forwardRef(
  (
    props: CustomContentEditableProps,
    ref: MutableRefObject<HTMLDivElement>,
  ) => {
    const { onKeyDown, onKeyUp, className } = props;

    const handleInput = useCallback(() => {
      const el = ref.current;
      if (!el) return;

      const isEmpty =
        el.innerText.trim() === "" ||
        el.innerHTML === "<br>" ||
        el.innerHTML === "<div><br></div>";

      if (isEmpty) {
        el.innerHTML = ""; // Dọn sạch
      }
    }, []);

    const handlePaste = useCallback((e: ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault(); // Ngăn trình duyệt dán HTML

      const text = e.clipboardData.getData("text/plain");

      // Chèn text vào đúng vị trí caret
      const selection = window.getSelection();
      if (!selection?.rangeCount) return;

      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(text));

      // Di chuyển caret đến sau đoạn dán
      selection.collapseToEnd();
    }, []);

    return (
      <div
        ref={ref}
        contentEditable={true}
        data-placeholder="Type your message here..."
        className={`${className ?? ""} editor hide-scrollbar outline-hidden relative min-h-8 w-full resize-none overflow-y-auto 
        break-all phone:max-h-[10rem] laptop:max-h-[7rem] laptop-lg:max-h-[10rem]`}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onInput={handleInput}
        onPaste={handlePaste}
      ></div>
    );
  },
);

export default CustomContentEditable;
