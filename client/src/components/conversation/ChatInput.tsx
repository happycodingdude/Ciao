import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import { useChatInputKeyboard } from "../../hooks/useChatInputKeyboard";
import useConversation from "../../hooks/useConversation";
import { useDrafts } from "../../hooks/useDraft";
import useEventListener from "../../hooks/useEventListener";
import { useFileAttachment } from "../../hooks/useFileAttachment";
import useInfo from "../../hooks/useInfo";
import { useMentionList } from "../../hooks/useMentionList";
import { useMessageActions, useMessageEdit } from "../../hooks/useMessageActions";
import { useReply } from "../../hooks/useReply";
import { useSendMessage } from "../../hooks/useSendMessage";
import { useStickerFavorites } from "../../hooks/useStickerFavorites";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import "../../styles/chatinput.css";
import { ChatInputProps } from "../../types/base.types";
import { AttachmentModel } from "../../types/message.types";
import { getMentionIds, getMessageValue, setCaretToEnd } from "../../utils/contentEditableUtils";
import useIsPhoneScreen from "../../hooks/useIsPhoneScreen";
import CustomContentEditable from "../common/CustomContentEditable";
import ReplyPreview from "../common/ReplyPreview";
import ImageItem from "../message/ImageItem";
import ChatInputToolbar from "./ChatInputToolbar";
import MentionDropdown from "./MentionDropdown";
import StickerPicker from "./StickerPicker";
import GifPicker from "./GifPicker";
import ShareContactModal from "./ShareContactModal";
import CreatePollModal from "./CreatePollModal";
import { ContactModel } from "../../types/friend.types";
import { PollModel } from "../../types/message.types";

const ChatInput = ({ className }: ChatInputProps) => {
  const { activeDetail } = useChatDetailToggles();
  // anyPanelOpen = có panel nào đang mở ở sidebar phải → chat input thu hẹp lại nhường chỗ.
  const anyPanelOpen = activeDetail !== null;
  const isPhone = useIsPhoneScreen();
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  const { conversationId } = Route.useParams();
  const conversation = conversations?.conversations?.find((c) => c.id === conversationId);
  const { reply, clearReply } = useReply();
  const { edit, clearEdit } = useMessageEdit();
  const { submitEdit } = useMessageActions(conversationId);
  const { drafts, setDraft, clearDraft } = useDrafts();

  const { send: sendMessage } = useSendMessage(conversationId);
  const { mentions, resetMentions, filterMentions } = useMentionList(
    conversation?.members ?? [],
    info?.id ?? "",
  );
  const { files, chooseFile, addFiles, removeFile, clearFiles } = useFileAttachment();
  const { markUsed: markStickerUsed } = useStickerFavorites();

  const [showMention, setShowMention] = useState(false);
  const [showSticker, setShowSticker] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [showShareContact, setShowShareContact] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLDivElement>(null);
  const refMentionContainer = useRef<HTMLDivElement | null>(null);
  const mentionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  // Latest-ref cho drafts: effect khôi phục chỉ chạy theo conversation?.id nhưng vẫn phải
  // đọc bản draft mới nhất tại thời điểm chuyển hội thoại (tránh stale + không re-run thừa).
  const draftsRef = useRef(drafts);
  draftsRef.current = drafts;

  // Lưu nội dung đang soạn thành draft của hội thoại hiện tại (bỏ qua khi đang sửa tin cũ).
  const saveDraft = useCallback(() => {
    if (edit || !inputRef.current) return;
    setDraft(conversationId, getMessageValue(inputRef.current));
  }, [edit, conversationId, setDraft]);

  useEffect(() => {
    // conversation chưa load → chờ
    if (!conversation) return;
    // Chuyển sang conversation khác → reset input state, rồi KHÔI PHỤC draft (nếu có).
    clearFiles();
    resetMentions();
    clearEdit();
    const saved = draftsRef.current[conversation.id] ?? "";
    if (inputRef.current) inputRef.current.innerText = saved;
    setIsEmpty(saved.trim() === "");
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
    // Gửi thành công (đã enqueue) → xóa draft của hội thoại này.
    clearDraft(conversationId);
  }, [files, sendMessage, clearFiles, edit, submitEdit, clearEdit, clearDraft, conversationId]);

  // Gửi sticker: tin độc lập (không kèm text/file), gửi ngay khi chọn.
  const sendSticker = useCallback(
    (stickerId: string) => {
      sendMessage({ type: "sticker", content: stickerId });
      markStickerUsed(stickerId);
      setShowSticker(false);
    },
    [sendMessage, markStickerUsed],
  );

  // Gửi GIF: tin độc lập type gif, Content = url GIF từ nguồn sẵn.
  const sendGif = useCallback(
    (gifUrl: string) => {
      sendMessage({ type: "gif", content: gifUrl });
      setShowGif(false);
    },
    [sendMessage],
  );

  // Chia sẻ danh bạ: gửi thẻ liên hệ của người được chọn vào hội thoại hiện tại.
  const shareContact = useCallback(
    (contact: ContactModel) => {
      sendMessage({
        type: "contact",
        content: contact.name ?? "",
        sharedContact: {
          contactId: contact.id ?? "",
          name: contact.name ?? "",
          avatar: contact.avatar,
        },
      });
      setShowShareContact(false);
    },
    [sendMessage],
  );

  // Tạo bình chọn: gửi tin type poll với câu hỏi ở content + dữ liệu poll.
  const createPoll = useCallback(
    (poll: PollModel) => {
      sendMessage({ type: "poll", content: poll.question, poll });
      setShowCreatePoll(false);
    },
    [sendMessage],
  );

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

  // Gõ phím xong → cập nhật trạng thái (mention/empty) như cũ, đồng thời lưu draft.
  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      keyupBindingFn(e);
      saveDraft();
    },
    [keyupBindingFn, saveDraft],
  );

  useEventListener("click", useCallback((e: Event) => {
    // Click ngoài vùng mention (không phải .mention-item) → đóng dropdown
    if (!(e.target as HTMLElement).closest?.(".mention-item")) setShowMention(false);
  }, []), undefined);

  useEventListener("keydown", useCallback((e: Event) => {
    if ((e as KeyboardEvent).key === "Escape") {
      setShowSticker(false);
    }
  }, []), undefined);

  // Click ngoài bảng sticker/gif (không phải panel/nút tương ứng) → đóng.
  useEventListener("click", useCallback((e: Event) => {
    const el = e.target as HTMLElement;
    if (!el.closest?.(".sticker-picker") && !el.closest?.(".sticker-item")) {
      setShowSticker(false);
    }
    if (!el.closest?.(".gif-picker") && !el.closest?.(".gif-item")) {
      setShowGif(false);
    }
  }, []), undefined);

  return (
    <div className="mb-2 flex w-full items-center justify-center">
      {/* Phone → fixed max-width; desktop: panel mở → thu hẹp max-width; panel đóng → rộng hơn */}
      <div
        className={`${className} chat-input-container relative flex w-full grow flex-col bg-(--bubble-bg) transition-all duration-200
          ${isPhone
            ? "max-w-140"
            : !anyPanelOpen ? "laptop-lg:max-w-240 laptop:max-w-200" : "laptop-lg:max-w-180 laptop:max-w-150"}`}
      >
        {reply && (
          <ReplyPreview contactName={reply.replyContactName} content={reply.replyContent} onClose={clearReply} />
        )}
        {edit && (
          <div className="flex w-full items-center justify-center py-4">
            <div className="flex w-[95%] items-center justify-between rounded-xl border-l-[.3rem] border-l-orange-400/60 bg-(--edit-banner-bg) px-4 py-2">
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
              onStickerClick={() => setShowSticker((v) => !v)}
              onGifClick={() => setShowGif((v) => !v)}
              onContactClick={() => setShowShareContact(true)}
              onPollClick={() => setShowCreatePoll(true)}
              onFileChange={chooseFile}
              onImageChange={chooseFile}
            />
            {showSticker && (
              <div className="absolute bottom-full left-2 z-30 mb-2">
                <StickerPicker
                  onSelect={sendSticker}
                  // Tab Emoji trong panel: chèn emoji vào ô nhập (thay nút emoji rời cũ),
                  // KHÔNG đóng panel để chèn được nhiều emoji liên tiếp.
                  onEmojiSelect={(native) => {
                    if (!inputRef.current) return;
                    inputRef.current.innerText += native;
                    setIsEmpty(false);
                    saveDraft();
                  }}
                />
              </div>
            )}
            {showGif && (
              <div className="absolute bottom-full left-2 z-30 mb-2">
                <GifPicker onSelect={sendGif} />
              </div>
            )}
            {showShareContact && (
              <ShareContactModal onPick={shareContact} onClose={() => setShowShareContact(false)} />
            )}
            {showCreatePoll && (
              <CreatePollModal onCreate={createPoll} onClose={() => setShowCreatePoll(false)} />
            )}
            <div className="flex items-end gap-4">
              <div className="flex-1 self-center">
                <CustomContentEditable ref={inputRef} onKeyDown={keydownBindingFn} onKeyUp={handleKeyUp} isEmpty={isEmpty} onPasteFiles={addFiles} />
              </div>
              <button className="send-btn laptop:w-9 flex aspect-square cursor-pointer items-center justify-center rounded-full bg-light-blue-400 text-white">
                <i className="fa-solid fa-paper-plane laptop:text-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
