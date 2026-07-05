import { ChangeEvent } from "react";

type Props = {
  onEmojiClick: () => void;
  onStickerClick: () => void;
  onGifClick: () => void;
  onContactClick: () => void;
  onPollClick: () => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const ChatInputToolbar = ({ onEmojiClick, onStickerClick, onGifClick, onContactClick, onPollClick, onFileChange, onImageChange }: Props) => (
  <div className="flex items-center gap-4">
    <label
      className="emoji-item toolbar-btn fa-regular fa-face-smile flex aspect-square cursor-pointer items-center justify-center rounded-full bg-(--toolbar-btn-bg) text-base text-(--toolbar-btn-text) hover:bg-(--toolbar-btn-bg) hover:text-light-blue-500"
      onClick={onEmojiClick}
    />
    {/* Sticker: mở bảng chọn nhãn dán built-in. */}
    <button
      type="button"
      title="Nhãn dán"
      className="sticker-item toolbar-btn fa-regular fa-note-sticky flex aspect-square cursor-pointer items-center justify-center rounded-full bg-(--toolbar-btn-bg) text-base text-(--toolbar-btn-text) hover:bg-(--toolbar-btn-bg) hover:text-light-blue-500"
      onClick={onStickerClick}
    />
    <div className="toolbar-btn flex aspect-square items-center justify-center rounded-full bg-(--toolbar-btn-bg) text-(--toolbar-btn-text) hover:bg-(--toolbar-btn-bg) hover:text-light-blue-500">
      <input
        multiple
        type="file"
        accept=".doc,.docx,.xls,.xlsx,.pdf"
        className="hidden"
        id="choose-file"
        onChange={onFileChange}
      />
      <label htmlFor="choose-file" className="flex w-full cursor-pointer items-center justify-center">
        <i className="fa-solid fa-paperclip text-base" />
      </label>
    </div>
    <div className="toolbar-btn flex aspect-square items-center justify-center rounded-full bg-(--toolbar-btn-bg) text-(--toolbar-btn-text) hover:bg-(--toolbar-btn-bg) hover:text-light-blue-500">
      <input
        multiple
        type="file"
        accept="image/*"
        className="hidden"
        id="choose-image"
        onChange={onImageChange}
      />
      <label htmlFor="choose-image" className="flex w-full cursor-pointer items-center justify-center">
        <i className="fa-solid fa-image text-base" />
      </label>
    </div>
    {/* GIF: mở bảng chọn GIF từ nguồn sẵn (không upload). */}
    <button
      type="button"
      title="Gửi GIF"
      className="gif-item toolbar-btn flex aspect-square cursor-pointer items-center justify-center rounded-full bg-(--toolbar-btn-bg) text-2xs font-bold leading-none tracking-tight text-(--toolbar-btn-text) hover:bg-(--toolbar-btn-bg) hover:text-light-blue-500"
      onClick={onGifClick}
    >
      GIF
    </button>
    {/* Chia sẻ danh bạ: mở modal chọn bạn bè để gửi thẻ liên hệ. */}
    <button
      type="button"
      title="Chia sẻ danh bạ"
      className="toolbar-btn flex aspect-square items-center justify-center rounded-full bg-(--toolbar-btn-bg) text-(--toolbar-btn-text) hover:bg-(--toolbar-btn-bg) hover:text-light-blue-500"
      onClick={onContactClick}
    >
      <i className="fa-regular fa-address-card text-base" />
    </button>
    {/* Tạo bình chọn */}
    <button
      type="button"
      title="Tạo bình chọn"
      className="toolbar-btn flex aspect-square items-center justify-center rounded-full bg-(--toolbar-btn-bg) text-(--toolbar-btn-text) hover:bg-(--toolbar-btn-bg) hover:text-light-blue-500"
      onClick={onPollClick}
    >
      <i className="fa-solid fa-square-poll-vertical text-base" />
    </button>
    <button className="toolbar-btn flex aspect-square items-center justify-center rounded-full bg-(--toolbar-btn-bg) text-(--toolbar-btn-text) hover:bg-(--toolbar-btn-bg) hover:text-light-blue-500">
      <i className="fa-solid fa-microphone text-base" />
    </button>
  </div>
);

export default ChatInputToolbar;
