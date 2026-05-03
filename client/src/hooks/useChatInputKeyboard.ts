import React, { RefObject, useCallback } from "react";
import { MentionModel } from "../types/message.types";
import { getCharBeforeCursor } from "../utils/contentEditableUtils";

type Params = {
  inputRef: RefObject<HTMLDivElement | null>;
  isEmpty: boolean;
  setIsEmpty: (v: boolean) => void;
  showMention: boolean;
  setShowMention: (v: boolean) => void;
  mentions: MentionModel[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  filterMentions: (text: string) => void;
  chat: () => void;
};

export const useChatInputKeyboard = ({
  inputRef,
  isEmpty,
  setIsEmpty,
  showMention,
  setShowMention,
  mentions,
  selectedIndex,
  setSelectedIndex,
  filterMentions,
  chat,
}: Params) => {
  // Chèn mention vào vị trí con trỏ, xóa ký tự "@..." trước đó
  const chooseMention = useCallback(
    (id: string) => {
      const user = mentions.find((m) => m.userId === id);
      // Không làm gì nếu không tìm thấy user hoặc input chưa mount
      if (!user || !inputRef.current) return;

      const selection = window.getSelection();
      // Cần có selection hợp lệ để xác định vị trí chèn
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const container = range.startContainer;
      const before = (container.textContent ?? "").substring(
        0,
        range.startOffset,
      );
      const atIndex = before.lastIndexOf("@");
      // Không tìm thấy "@" trước con trỏ → không phải mention context
      if (atIndex === -1) return;

      // Xóa toàn bộ "@..." từ vị trí @ đến con trỏ
      range.setStart(container, atIndex);
      range.deleteContents();

      // Tạo span non-editable để phân biệt mention khỏi text thường khi parse
      const node = document.createElement("span");
      node.textContent = user.name;
      node.setAttribute("data-mention", `@[${user.name}]`);
      node.contentEditable = "false";
      node.style.color = "#1d9bf0";
      node.style.fontWeight = "500";

      range.insertNode(node);

      // Thêm khoảng trắng sau mention để tiếp tục gõ bình thường
      const space = document.createTextNode(" ");
      node.after(space);
      range.setStartAfter(space);
      range.setEndAfter(space);
      selection.removeAllRanges();
      selection.addRange(range);

      setShowMention(false);
      setSelectedIndex(0);
    },
    [mentions, inputRef, setShowMention, setSelectedIndex],
  );

  const keydownBindingFn = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.nativeEvent.isComposing) return;

      const key = e.key;

      // Di chuyển highlight trong danh sách mention (wraps around)
      if (key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((p) => (p + 1) % mentions.length);
      } else if (key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((p) => (p - 1 + mentions.length) % mentions.length);
      }

      // Enter khi mention đang mở → chọn mention thay vì gửi tin nhắn
      if (key === "Enter" && showMention) {
        e.preventDefault();
        chooseMention(mentions[selectedIndex]?.userId);
      } else if (key === "Enter" && !e.shiftKey) {
        // Enter không có Shift → gửi tin; Shift+Enter → xuống dòng
        e.preventDefault();
        chat();
      }

      // Lần đầu gõ phím (không phải Backspace) → đánh dấu input không còn rỗng
      if (isEmpty && key !== "Backspace") setIsEmpty(false);

      // Xóa ký tự ngay trước "@" → đóng mention dropdown
      if (
        key === "Backspace" &&
        inputRef.current &&
        getCharBeforeCursor(inputRef.current) === "@"
      ) {
        setShowMention(false);
      }

      // Gõ "@" → mở mention dropdown; nếu đang ở vị trí ngay sau "@" khác thì ngăn nhập đôi
      if (key === "@") {
        setShowMention(true);
        if (inputRef.current && getCharBeforeCursor(inputRef.current) === "@")
          e.preventDefault();
      }

      // Escape → đóng dropdown mention
      if (key === "Escape") setShowMention(false);
      // Gõ dấu cách → kết thúc từ mention, đóng dropdown
      if (key === " " && showMention) setShowMention(false);
    },
    [
      isEmpty,
      chat,
      mentions,
      selectedIndex,
      chooseMention,
      showMention,
      setIsEmpty,
      setSelectedIndex,
      setShowMention,
      inputRef,
    ],
  );

  const keyupBindingFn = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const input = inputRef.current;
      if (!input) return;

      // Nếu nội dung trở về rỗng sau khi xóa → reset isEmpty
      if (input.innerText.trim() === "" && !isEmpty) setIsEmpty(true);

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const cloned = range.cloneRange();
      cloned.selectNodeContents(input);
      cloned.setEnd(range.endContainer, range.endOffset);
      const pos = cloned.toString().length;
      // Con trỏ ở đầu → không có text để search mention
      if (pos === 0) return;

      if (e.ctrlKey && e.key === " ") {
        // Ctrl+Space → kích hoạt mention search thủ công từ vị trí "@" gần nhất
        const textBefore = input.innerText.substring(0, pos);
        const atIdx = textBefore.lastIndexOf("@");
        if (atIdx !== -1 && !/\s/.test(textBefore.substring(atIdx + 1)))
          setShowMention(true);
      } else if (showMention) {
        // Đang trong mention mode → lọc danh sách theo text gõ sau "@"
        const beforeCursor = input.innerText.substring(0, pos);
        const atIdx = beforeCursor.lastIndexOf("@");
        if (atIdx !== -1) {
          const afterAt = input.innerText.substring(atIdx + 1);
          const spaceIdx = afterAt.search(/\s/);
          // Lấy phần search text từ "@" đến khoảng trắng đầu tiên (hoặc hết)
          filterMentions(
            spaceIdx === -1 ? afterAt : afterAt.substring(0, spaceIdx),
          );
        }
      }
    },
    [
      isEmpty,
      showMention,
      filterMentions,
      setIsEmpty,
      setShowMention,
      inputRef,
    ],
  );

  return { keydownBindingFn, keyupBindingFn, chooseMention };
};
