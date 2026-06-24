import {
  MutableRefObject,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import { useChatInputKeyboard } from "../../hooks/useChatInputKeyboard";
import useConversation from "../../hooks/useConversation";
import useEventListener from "../../hooks/useEventListener";
import { useFileAttachment } from "../../hooks/useFileAttachment";
import useInfo from "../../hooks/useInfo";
import { useMentionList } from "../../hooks/useMentionList";
import { useMessageActions, useMessageEdit } from "../../hooks/useMessageActions";
import { useReply } from "../../hooks/useReply";
import { useSendMessage } from "../../hooks/useSendMessage";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import "../../styles/chatinput.css";
import { ChatInputProps } from "../../types/base.types";
import { AttachmentModel } from "../../types/message.types";
import { getMentionIds, getMessageValue, setCaretToEnd } from "../../utils/contentEditableUtils";
import { isPhoneScreen } from "../../utils/getScreenSize";
import CustomContentEditable from "../common/CustomContentEditable";
import ReplyPreview from "../common/ReplyPreview";
import ImageItem from "../message/ImageItem";
import ChatInputToolbar from "./ChatInputToolbar";
import MentionDropdown from "./MentionDropdown";

const LazyEmojiPicker = lazy(() => import("../common/LazyEmojiPicker"));

const ChatInput = ({ className }: ChatInputProps) => {
  const { activeDetail } = useChatDetailToggles();
  // anyPanelOpen = có panel nào đang mở ở sidebar phải → chat input thu hẹp lại nhường chỗ.
  const anyPanelOpen = activeDetail !== null;
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  const { conversationId } = Route.useParams();
  const conversation = conversations?.conversations?.find((c) => c.id === conversationId);
  const { reply, clearReply } = useReply();
  const { edit, clearEdit } = useMessageEdit();
  const { submitEdit } = useMessageActions(conversationId);

  const sendMessage = useSendMessage(conversationId);
  const { mentions, resetMentions, filterMentions } = useMentionList(
    conversation?.members ?? [],
    info?.id ?? "",
  );
  const { files, chooseFile, addFiles, removeFile, clearFiles } = useFileAttachment();

  const [showMention, setShowMention] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLDivElement>(null);
  const refMentionContainer = useRef<HTMLDivElement | null>(null);
  const mentionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    // conversation chưa load → chờ
    if (!conversation) return;
    // Chuyển sang conversation khác → reset toàn bộ input state
    clearFiles();
    resetMentions();
    clearEdit();
    if (inputRef.current) inputRef.current.innerText = "";
  }, [conversation?.id]);

  useEffect(() => {
    // Vào edit mode → prefill nội dung hiện tại, đưa caret về cuối để user sửa ngay.
    if (edit && inputRef.current) {
      inputRef.current.innerText = edit.content;
      setIsEmpty(edit.content.trim() === "");
      setCaretToEnd(inputRef.current, false);
    }
  }, [edit?.messageId]);

  useEffect(() => {
    // Có file được thêm → đưa caret về cuối contentEditable để user tiếp tục gõ caption
    if (files.length !== 0 && inputRef.current) setCaretToEnd(inputRef.current, false);
  }, [files]);

  useEffect(() => {
    const container = refMentionContainer.current;
    const item = mentionRefs.current[selectedIndex];
    // Container hoặc item chưa mount → bỏ qua
    if (!container || !item) return;
    const itemBottom = item.offsetTop + item.clientHeight;
    // Item bị ẩn phía trên → scroll lên để item hiện trên cùng
    if (item.offsetTop < container.scrollTop)
      container.scrollTo({ top: item.offsetTop, behavior: "smooth" });
    // Item bị ẩn phía dưới → scroll xuống để item hiện dưới cùng
    else if (itemBottom > container.scrollTop + container.clientHeight)
      container.scrollTo({ top: itemBottom - container.clientHeight, behavior: "smooth" });
  }, [selectedIndex]);

  const chat = useCallback(() => {
    if (!inputRef.current) return;
    const content = getMessageValue(inputRef.current);

    // Đang edit → submit chỉnh sửa (optimistic) thay vì gửi tin mới.
    if (edit) {
      if (content !== "") submitEdit(edit.messageId, content);
      else clearEdit();
      inputRef.current.innerText = "";
      return;
    }

    // Không có nội dung text và không có file → không gửi
    if (content === "" && files.length === 0) return;
    const lazyImages: AttachmentModel[] = files.map((f) => ({
      type: "image",
      mediaUrl: URL.createObjectURL(f),
      pending: true,
      local: true,
    }));
    // Thu thập userId các mention (Option B) để BE tạo notification cho người bị tag.
    const mentions = getMentionIds(inputRef.current);
    // Không có text → type "media"; có text → type "text"
    sendMessage({ type: content === "" ? "media" : "text", content, attachments: lazyImages, files, mentions });
    inputRef.current.innerText = "";
    clearFiles();
  }, [files, sendMessage, clearFiles, edit, submitEdit, clearEdit]);

  const { keydownBindingFn, keyupBindingFn, chooseMention } = useChatInputKeyboard({
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
  });

  useEventListener("click", useCallback((e: Event) => {
    // Click ngoài vùng mention (không phải .mention-item) → đóng dropdown
    if (!(e.target as HTMLElement).closest?.(".mention-item")) setShowMention(false);
  }, []), undefined);

  useEventListener("keydown", useCallback((e: Event) => {
    if ((e as KeyboardEvent).key === "Escape") setShowEmoji(false);
  }, []), undefined);

  return (
    <div className="mb-2 flex w-full items-center justify-center">
      {/* Phone → fixed max-width; desktop: panel mở → thu hẹp max-width; panel đóng → rộng hơn */}
      <div
        className={`${className} chat-input-container relative flex w-full grow flex-col bg-white transition-all duration-200
          ${isPhoneScreen()
            ? "max-w-140"
            : !anyPanelOpen ? "laptop-lg:max-w-240 laptop:max-w-200" : "laptop-lg:max-w-180 laptop:max-w-150"}`}
      >
        {reply && (
          <ReplyPreview contactName={reply.replyContactName} content={reply.replyContent} onClose={clearReply} />
        )}
        {edit && (
          <div className="flex w-full items-center justify-center py-4">
            <div className="flex w-[95%] items-center justify-between rounded-xl border-l-[.3rem] border-l-orange-400/60 bg-orange-50 px-4 py-2">
              <div className="max-w-[80%]">
                <p className="truncate italic text-orange-500">Editing message</p>
                <p className="truncate">{edit.content}</p>
              </div>
              <i
                className="fa fa-times cursor-pointer"
                onClick={() => {
                  clearEdit();
                  if (inputRef.current) inputRef.current.innerText = "";
                }}
              />
            </div>
          </div>
        )}
        {files.length !== 0 && (
          <div className="flex gap-4 overflow-x-auto rounded-2xl px-6 py-3">
            {files.map((item) => <ImageItem file={item} onClick={removeFile} key={item.name} />)}
          </div>
        )}
        <div className="mention-item relative w-full">
          {conversation?.isGroup && (
            <MentionDropdown
              mentions={mentions}
              selectedIndex={selectedIndex}
              show={showMention}
              containerRef={refMentionContainer}
              itemRefs={mentionRefs as MutableRefObject<Record<number, HTMLDivElement | null>>}
              onChoose={chooseMention}
            />
          )}
          <div className="flex flex-col gap-4 px-4 pb-2 pt-4">
            <ChatInputToolbar
              onEmojiClick={() => setShowEmoji(true)}
              onFileChange={chooseFile}
              onImageChange={chooseFile}
            />
            <div className="flex items-end gap-4">
              <div className="flex-1 self-center">
                <CustomContentEditable ref={inputRef} onKeyDown={keydownBindingFn} onKeyUp={keyupBindingFn} isEmpty={isEmpty} onPasteFiles={addFiles} />
              </div>
              <button className="send-btn laptop:w-9 flex aspect-square cursor-pointer items-center justify-center rounded-full bg-light-blue-400 text-white">
                <i className="fa-solid fa-paper-plane laptop:text-xs" />
              </button>
            </div>
          </div>
        </div>
        {showEmoji && (
          <div className="-top-176 absolute left-0">
            <Suspense fallback={<div className="h-176 w-84 animate-pulse rounded-lg bg-gray-100" />}>
              <LazyEmojiPicker
                onEmojiSelect={(e) => { if (inputRef.current) inputRef.current.innerText += e.native; }}
                onClickOutside={(e) => {
                  if (e.target.classList.contains("emoji-item")) setShowEmoji(true);
                  else setShowEmoji(false);
                }}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
