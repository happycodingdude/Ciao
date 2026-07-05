import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { PollModel } from "../../types/message.types";

type Props = {
  onCreate: (poll: PollModel) => void;
  onClose: () => void;
};

const MAX_OPTIONS = 10;
const genKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// Modal tạo bình chọn: câu hỏi + tối thiểu 2 lựa chọn + tùy chọn cho phép chọn nhiều.
const CreatePollModal = ({ onCreate, onClose }: Props) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<{ key: string; text: string }[]>([
    { key: genKey(), text: "" },
    { key: genKey(), text: "" },
  ]);
  const [allowMultiple, setAllowMultiple] = useState(false);

  const setOptionText = (key: string, text: string) =>
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, text } : o)));

  const addOption = () =>
    setOptions((prev) => (prev.length >= MAX_OPTIONS ? prev : [...prev, { key: genKey(), text: "" }]));

  const removeOption = (key: string) =>
    setOptions((prev) => (prev.length <= 2 ? prev : prev.filter((o) => o.key !== key)));

  const submit = () => {
    const q = question.trim();
    const validOptions = options.map((o) => ({ ...o, text: o.text.trim() })).filter((o) => o.text);
    if (!q) return toast.error("Vui lòng nhập câu hỏi");
    if (validOptions.length < 2) return toast.error("Cần ít nhất 2 lựa chọn");

    onCreate({
      question: q,
      allowMultiple,
      options: validOptions.map((o) => ({ key: o.key, text: o.text, voterIds: [] })),
    });
  };

  // Portal ra body: tránh ancestor có transform khiến `fixed` không canh giữa viewport.
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-(--modal-border-color) bg-(--bg-color) shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-(--modal-border-color) px-4 py-3">
          <p className="font-semibold text-(--text-main-color)">Tạo bình chọn</p>
          <button type="button" onClick={onClose} className="cursor-pointer text-(--text-main-color-blur) hover:text-(--text-main-color)">
            <i className="fa fa-times" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <label className="text-2xs font-semibold uppercase tracking-wide text-(--text-main-color-blur)">Câu hỏi</label>
          <input
            autoFocus
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Bạn muốn hỏi gì?"
            className="mb-4 mt-1 w-full rounded-xl border border-(--modal-border-color) bg-(--search-bg-color) px-4 py-2 text-(--text-main-color) outline-none"
          />

          <label className="text-2xs font-semibold uppercase tracking-wide text-(--text-main-color-blur)">Lựa chọn</label>
          <div className="mt-1 flex flex-col gap-2">
            {options.map((o, i) => (
              <div key={o.key} className="flex items-center gap-2">
                <input
                  value={o.text}
                  onChange={(e) => setOptionText(o.key, e.target.value)}
                  placeholder={`Lựa chọn ${i + 1}`}
                  className="flex-1 rounded-xl border border-(--modal-border-color) bg-(--search-bg-color) px-4 py-2 text-(--text-main-color) outline-none"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(o.key)}
                    className="cursor-pointer px-1 text-(--text-main-color-blur) hover:text-red-500"
                  >
                    <i className="fa fa-times" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < MAX_OPTIONS && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 flex items-center gap-2 text-sm text-light-blue-500 hover:underline"
            >
              <i className="fa fa-plus" /> Thêm lựa chọn
            </button>
          )}

          <label className="mt-4 flex cursor-pointer items-center gap-2 text-(--text-main-color)">
            <input type="checkbox" checked={allowMultiple} onChange={(e) => setAllowMultiple(e.target.checked)} />
            Cho phép chọn nhiều đáp án
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-(--modal-border-color) px-4 py-3">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-xl px-4 py-2 text-(--text-main-color-blur) hover:bg-(--bg-color-extrathin)">
            Hủy
          </button>
          <button type="button" onClick={submit} className="cursor-pointer rounded-xl bg-light-blue-500 px-4 py-2 font-medium text-white hover:bg-light-blue-600">
            Tạo
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CreatePollModal;
