import { ChangeEvent } from "react";

type Props = {
  onEmojiClick: () => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const ChatInputToolbar = ({ onEmojiClick, onFileChange, onImageChange }: Props) => (
  <div className="flex items-center gap-4">
    <label
      className="emoji-item toolbar-btn fa-regular fa-face-smile flex aspect-square cursor-pointer items-center justify-center rounded-full bg-gray-100 text-base text-gray-500 hover:bg-gray-100 hover:text-light-blue-500"
      onClick={onEmojiClick}
    />
    <div className="toolbar-btn flex aspect-square items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-100 hover:text-light-blue-500">
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
    <div className="toolbar-btn flex aspect-square items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-100 hover:text-light-blue-500">
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
    <button className="toolbar-btn flex aspect-square items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-100 hover:text-light-blue-500">
      <i className="fa-solid fa-microphone text-base" />
    </button>
  </div>
);

export default ChatInputToolbar;
