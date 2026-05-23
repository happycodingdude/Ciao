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
export type ChatDetailKind = "search" | "information" | "attachment";

export type ChatDetailTogglesContextValue = {
  activeDetail: ChatDetailKind | null;
  setActiveDetail: (kind: ChatDetailKind | null) => void;
  // Click icon = nếu đang active thì đóng, ngược lại mở (replace panel đang mở).
  toggleDetail: (kind: ChatDetailKind) => void;
  // Derived flags để consumer chỉ cần đọc đúng panel của mình.
  showSearch: boolean;
  showInformation: boolean;
  showAttachment: boolean;
};

export const ChatDetailTogglesContext = createContext<
  ChatDetailTogglesContextValue | undefined
>(undefined);

const STORAGE_KEY = "toggleChatDetail";

// Validate value đọc từ localStorage — chỉ chấp nhận đúng 3 string hợp lệ,
// ngoài ra (null/format cũ/user sửa tay) đều fallback null.
const isValidKind = (v: unknown): v is ChatDetailKind =>
  v === "search" || v === "information" || v === "attachment";

const readActive = (): ChatDetailKind | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isValidKind(raw) ? raw : null;
  } catch {
    return null;
  }
};

const ChatDetailTogglesProvider = ({ children }: { children: ReactNode }) => {
  const initial = useMemo(() => readActive(), []);
  const [activeDetail, setActiveDetail] = useState<ChatDetailKind | null>(
    initial,
  );

  // Persist: có panel active → ghi string; không → xóa key cho sạch.
  useEffect(() => {
    if (activeDetail) localStorage.setItem(STORAGE_KEY, activeDetail);
    else localStorage.removeItem(STORAGE_KEY);
  }, [activeDetail]);

  const toggleDetail = useCallback((kind: ChatDetailKind) => {
    setActiveDetail((prev) => (prev === kind ? null : kind));
  }, []);

  const value = useMemo<ChatDetailTogglesContextValue>(
    () => ({
      activeDetail,
      setActiveDetail,
      toggleDetail,
      showSearch: activeDetail === "search",
      showInformation: activeDetail === "information",
      showAttachment: activeDetail === "attachment",
    }),
    [activeDetail, toggleDetail],
  );

  return (
    <ChatDetailTogglesContext.Provider value={value}>
      {children}
    </ChatDetailTogglesContext.Provider>
  );
};

export default ChatDetailTogglesProvider;
