import {
  ClipboardEvent,
  ForwardedRef,
  forwardRef,
  useCallback,
} from "react";
import { CustomContentEditableProps } from "../../types/base.types";

const CustomContentEditable = forwardRef(
  (
    props: CustomContentEditableProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const { onKeyDown, onKeyUp, className, quickChat, onPasteFiles } = props;

    const handleInput = useCallback(() => {
      const el = typeof ref === "function" || !ref ? null : ref.current;
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

      // Ưu tiên xử lý image trước. Nếu clipboard có image thì bỏ qua nhánh text:
      // tránh trường hợp clipboard chứa cả text fallback (vd "image.png") rồi dán nhầm vào editor.
      // Lưu ý: ảnh paste từ screenshot/clipboard browser sẽ tự đặt tên kiểu "image.png" — đây không phải bug.
      const imageFiles = Array.from(e.clipboardData.files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (imageFiles.length > 0) {
        // Đẩy vào pipeline upload chung (giống hệt khi chọn ảnh từ icon).
        // Dedupe theo file.name được xử lý ở useFileAttachment.addFiles.
        onPasteFiles?.(imageFiles);
        return;
      }

      const text = e.clipboardData.getData("text/plain");

      // Chèn text vào đúng vị trí caret
      const selection = window.getSelection();
      if (!selection?.rangeCount) return;

      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(text));

      // Di chuyển caret đến sau đoạn dán
      selection.collapseToEnd();
    }, [onPasteFiles]);

    return (
      <div
        ref={ref}
        contentEditable={true}
        data-placeholder="Type your message here..."
        className={`${className ?? ""} editor hide-scrollbar outline-hidden relative min-h-5 w-full resize-none overflow-y-auto break-all laptop:text-xs
        ${quickChat
            ? "phone:max-h-40 laptop:max-h-10 laptop-lg:max-h-40"
            : "phone:max-h-40 laptop:max-h-28 laptop-lg:max-h-40"
          }`}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onInput={handleInput}
        onPaste={handlePaste}
      ></div>
    );
  },
);

export default CustomContentEditable;
