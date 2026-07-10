import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

// Sidebar phải chỉ hiển thị 1 panel tại 1 thời điểm (Search / Information / Attachment).
// State source: 1 string `activeDetail` — mutually exclusive ngay tại nguồn, không cần
// derive bằng priority. Persist nguyên string vào localStorage để refresh giữ panel.
export type ChatDetailKind = "search" | "information" | "attachment" | "bookmark";

// Tab đang chọn trong panel Attachment. Nằm ở context (không phải state local của
// Attachment.tsx) vì Information cần preselect tab khi bấm "View all" của từng section —
// Attachment luôn mounted (ẩn bằng z-index) nên chỉ context mới re-render nó tức thì.
// KHÔNG persist localStorage: mỗi lần mở panel từ đầu luôn default "image".
export type AttachmentTabKind = "image" | "file" | "video" | "link";

export type ChatDetailTogglesContextValue = {
  activeDetail: ChatDetailKind | null;
  setActiveDetail: (kind: ChatDetailKind | null) => void;
  // Click icon = nếu đang active thì đóng, ngược lại mở (replace panel đang mở).
  toggleDetail: (kind: ChatDetailKind) => void;
  // Derived flags để consumer chỉ cần đọc đúng panel của mình.
  showSearch: boolean;
  showInformation: boolean;
  showAttachment: boolean;
  showBookmark: boolean;
  attachmentTab: AttachmentTabKind;
  setAttachmentTab: (tab: AttachmentTabKind) => void;
  // "View all" của từng section Information: chọn tab rồi mở panel Attachment.
  openAttachment: (tab: AttachmentTabKind) => void;
};

export const ChatDetailTogglesContext = createContext<
  ChatDetailTogglesContextValue | undefined
>(undefined);

const STORAGE_KEY = "toggleChatDetail";

// Validate value đọc từ localStorage — chỉ chấp nhận đúng 3 string hợp lệ,
// ngoài ra (null/format cũ/user sửa tay) đều fallback null.
const isValidKind = (v: unknown): v is ChatDetailKind =>
  v === "search" || v === "information" || v === "attachment" || v === "bookmark";

const readActive = (): ChatDetailKind | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isValidKind(raw) ? raw : null;
  } catch {
    return null;
  }
};

// --- Conversation-switch tracker (module-scope để survive remount qua Suspense/loader) ---
// ChatboxContainer reset panel về "information" mỗi khi đổi conversation, nhưng effect đó
// (cha) chạy SAU effect của các panel con (InformationBookmark). Không có tracker này,
// panel bookmark đang mở sẽ bắn API load bookmark (keyword rỗng) cho conversation MỚI
// rồi mới bị reset về Information → call thừa. Panel đọc willResetPanelOnConversation()
// trong effect của mình để biết trước mình sắp bị đóng và skip fetch.
let prevConversationId: string | null = null;

export const willResetPanelOnConversation = (conversationId: string) =>
  prevConversationId !== null && prevConversationId !== conversationId;

// ChatboxContainer gọi trong effect: trả về true nếu vừa đổi conversation (cần reset panel),
// đồng thời commit conversationId mới làm mốc so sánh cho lần sau.
export const commitPanelConversation = (conversationId: string) => {
  const shouldReset = willResetPanelOnConversation(conversationId);
  prevConversationId = conversationId;
  return shouldReset;
};

const ChatDetailTogglesProvider = ({ children }: { children: ReactNode }) => {
  const initial = useMemo(() => readActive(), []);
  const [activeDetail, setActiveDetail] = useState<ChatDetailKind | null>(
    initial,
  );
  const [attachmentTab, setAttachmentTab] = useState<AttachmentTabKind>("image");

  // Persist: có panel active → ghi string; không → xóa key cho sạch.
  useEffect(() => {
    if (activeDetail) localStorage.setItem(STORAGE_KEY, activeDetail);
    else localStorage.removeItem(STORAGE_KEY);
  }, [activeDetail]);

  const toggleDetail = useCallback((kind: ChatDetailKind) => {
    setActiveDetail((prev) => (prev === kind ? null : kind));
  }, []);

  const openAttachment = useCallback((tab: AttachmentTabKind) => {
    setAttachmentTab(tab);
    setActiveDetail("attachment");
  }, []);

  const value = useMemo<ChatDetailTogglesContextValue>(
    () => ({
      activeDetail,
      setActiveDetail,
      toggleDetail,
      showSearch: activeDetail === "search",
      showInformation: activeDetail === "information",
      showAttachment: activeDetail === "attachment",
      showBookmark: activeDetail === "bookmark",
      attachmentTab,
      setAttachmentTab,
      openAttachment,
    }),
    [activeDetail, toggleDetail, attachmentTab, openAttachment],
  );

  return (
    <ChatDetailTogglesContext.Provider value={value}>
      {children}
    </ChatDetailTogglesContext.Provider>
  );
};

export default ChatDetailTogglesProvider;
