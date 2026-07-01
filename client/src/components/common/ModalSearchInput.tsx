import { ChangeEventHandler, MutableRefObject } from "react";

type ModalSearchInputProps = {
  // Chấp nhận cả ref có `reset` (CustomInput-style) lẫn ref thường để dùng chung mọi modal.
  inputRef?: MutableRefObject<any>;
  placeholder?: string;
  className?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

/**
 * Ô tìm kiếm dùng chung cho các hộp thoại: hộp bo góc có viền,
 * icon kính lúp bên trái, nền inset. Đồng bộ diện mạo mọi modal.
 */
const ModalSearchInput = ({
  inputRef,
  placeholder = "Search for name",
  className,
  onChange,
}: ModalSearchInputProps) => {
  return (
    <div className={`relative shrink-0 ${className ?? ""}`}>
      <i className="fa-solid fa-magnifying-glass text-(--text-main-color-blur) pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm" />
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        className="bg-(--search-bg-color) text-(--text-main-color) focus:border-light-blue-500 border-(--modal-border-color) w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-colors"
      />
    </div>
  );
};

export default ModalSearchInput;
