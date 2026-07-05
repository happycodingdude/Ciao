import {
  ChangeEventHandler,
  KeyboardEventHandler,
  MutableRefObject,
} from "react";

type ModalSearchInputProps = {
  // Chấp nhận cả ref có `reset` (CustomInput-style) lẫn ref thường để dùng chung mọi modal.
  inputRef?: MutableRefObject<any>;
  placeholder?: string;
  className?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  // Cho ô search cần trigger tường minh (vd search server bằng Enter). Optional để
  // không ảnh hưởng các modal search live (chỉ dùng onChange).
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  // Khi truyền, icon kính lúp trở thành nút bấm để search (ngoài Enter). Mặc định
  // icon chỉ trang trí (pointer-events-none) như cũ.
  onIconClick?: () => void;
  // Làm mờ + vô hiệu icon trigger (vd keyword rỗng / đang tải). Chỉ có tác dụng khi
  // onIconClick được truyền.
  iconDisabled?: boolean;
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
  onKeyDown,
  onIconClick,
  iconDisabled,
}: ModalSearchInputProps) => {
  return (
    <div className={`relative shrink-0 ${className ?? ""}`}>
      <i
        onClick={onIconClick && !iconDisabled ? onIconClick : undefined}
        className={`fa-solid fa-magnifying-glass text-(--text-main-color-blur) absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-opacity ${
          onIconClick
            ? iconDisabled
              ? "pointer-events-none opacity-40"
              : "cursor-pointer hover:opacity-70"
            : "pointer-events-none"
        }`}
      />
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="bg-(--search-bg-color) text-(--text-main-color) border-(--modal-border-color) w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-light-blue-500"
      />
    </div>
  );
};

export default ModalSearchInput;
