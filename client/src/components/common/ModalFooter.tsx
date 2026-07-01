type ModalFooterProps = {
  // Huỷ mọi thay đổi và đóng hộp thoại.
  onCancel?: () => void;
  // Áp dụng thay đổi (CTA chính của hộp thoại).
  onSave?: () => void;
  cancelTitle?: string;
  saveTitle?: string;
  // Hiển thị spinner trên nút Lưu khi đang xử lý.
  processing?: boolean;
  // Kẻ đường phân cách phía trên footer, tách khỏi phần nội dung.
  divider?: boolean;
};

/**
 * Phần cuối dùng chung cho các hộp thoại dạng "chọn rồi xác nhận":
 * nút Huỷ (nền xám đặc) + nút Lưu (nền xanh đặc), bo góc, căn phải.
 */
const ModalFooter = ({
  onCancel,
  onSave,
  cancelTitle = "Cancel",
  saveTitle = "Save",
  processing,
  divider,
}: ModalFooterProps) => {
  return (
    <div
      className={`flex shrink-0 items-center justify-end gap-3 ${divider ? "border-(--modal-border-color) border-t pt-5" : "pt-4"
        }`}
    >
      <button
        type="button"
        onClick={onCancel}
        className="text-(--text-main-color) bg-(--bg-color-extrathin) hover:bg-(--bg-color-thin) rounded-xl px-6 py-2.5 text-sm font-medium transition-colors"
      >
        {cancelTitle}
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={processing}
        className="bg-light-blue-500 hover:bg-light-blue-600 min-w-24 rounded-xl px-7 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
      >
        {processing ? <span className="fa fa-spinner fa-spin" /> : saveTitle}
      </button>
    </div>
  );
};

export default ModalFooter;
