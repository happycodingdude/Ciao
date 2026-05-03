// Đặt con trỏ về cuối nội dung trong contentEditable element
export const setCaretToEnd = (el: HTMLDivElement, addSpace: boolean) => {
  // Thêm khoảng trắng khi cần tách mention với text tiếp theo
  if (addSpace) el.innerHTML += "&nbsp;";
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const selection = window.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
};

// Parse nội dung contentEditable thành text thuần, xử lý mention span và xuống dòng
export const getMessageValue = (el: HTMLDivElement): string => {
  const parseNodes = (nodes: NodeListOf<ChildNode>): string => {
    let result = "";
    nodes.forEach((node: any) => {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const htmlEl = node as HTMLElement;
        const mention = htmlEl.getAttribute?.("data-mention");
        if (mention) {
          // Mention span → dùng giá trị data-mention thay vì text hiển thị
          result += mention;
          return;
        }
        if (htmlEl.tagName === "BR") {
          // BR element → xuống dòng thật
          result += "\n";
          return;
        }
        if (htmlEl.tagName === "DIV" || htmlEl.tagName === "P") {
          // Block element (Chrome tự wrap khi Enter) → thêm newline sau khi parse children
          result += parseNodes(htmlEl.childNodes) + "\n";
          return;
        }
        // Inline element khác → chỉ parse children
        result += parseNodes(htmlEl.childNodes);
      }
    });
    return result;
  };
  return parseNodes(el.childNodes);
};

// Lấy ký tự ngay trước vị trí con trỏ hiện tại (dùng để detect "@" trigger)
export const getCharBeforeCursor = (el: HTMLDivElement): string | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  const cloned = range.cloneRange();
  cloned.selectNodeContents(el);
  cloned.setEnd(range.endContainer, range.endOffset);
  const text = el.innerText.substring(0, cloned.toString().length);
  // Trả về null nếu không có ký tự nào (con trỏ ở đầu)
  return text[text.length - 1] || null;
};
