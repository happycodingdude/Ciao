import { useEffect, useRef } from "react";
import { commitPanelConversation } from "../../context/ChatDetailTogglesContext";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import useConversation from "../../hooks/useConversation";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import "../../styles/chatAppearance.css";
import { getWallpaperClass } from "../../utils/chatAppearance";
import Attachment from "../conversation/Attachment";
import Chatbox from "../conversation/Chatbox";
import ChatboxHeader from "../conversation/ChatboxHeader";
import ChatInput from "../conversation/ChatInput";
import Information from "../conversation/Information";
import InformationBookmark from "../conversation/InformationBookmark";
import InformationPin from "../conversation/InformationPin";
import InformationSearch from "../conversation/InformationSearch";

const ChatboxContainer = () => {
  const { activeDetail, setActiveDetail } = useChatDetailToggles();

  // anyPanelOpen = sidebar phải đang hiển thị panel nào đó.
  const anyPanelOpen = activeDetail !== null;

  const refChatboxContainer = useRef<HTMLDivElement>(null);

  const { conversationId } = Route.useParams();

  // Phase 3 — Đợt 3: hình nền chat CHUNG của hội thoại (mọi thành viên đều thấy).
  // Class preset chỉ override CSS var --chat-bg-from/to trên wrapper;
  // không có preset → gradient mặc định theme.
  const { data: conversations } = useConversation();
  const conversation = conversations?.conversations?.find(
    (c) => c.id === conversationId,
  );
  const wallpaperClass = getWallpaperClass(conversation?.wallpaper);

  // Khi user chuyển conversation: default về panel Information bất kể đang ở panel nào.
  // KHÔNG chạy ở mount đầu của tab — giữ nguyên activeDetail vừa restore từ localStorage
  // để refresh page không bị mất state user đang dùng. Tracker đặt module-scope trong
  // ChatDetailTogglesContext để survive remount (Suspense/loader) và để panel con
  // (InformationBookmark) biết trước mình sắp bị đóng mà skip fetch thừa.
  useEffect(() => {
    if (commitPanelConversation(conversationId)) {
      setActiveDetail("information");
    }
  }, [conversationId, setActiveDetail]);

  // Phím tắt mở nhanh UI Search messages: Ctrl+F (Win/Linux) hoặc Cmd+F (Mac).
  // Ghi đè default find của browser.
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      const isModPressed = e.metaKey || e.ctrlKey;
      // Loại trừ Shift/Alt để tránh đè lên shortcut khác (vd Ctrl+Shift+F).
      if (!isModPressed || e.shiftKey || e.altKey) return;
      if (e.key.toLowerCase() !== "f") return;
      e.preventDefault();
      setActiveDetail("search");
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [setActiveDetail]);

  return (
    <div className="flex h-full">
      <div
        className={`bg-linear-to-br flex w-full grow flex-col from-(--chat-bg-from) to-(--chat-bg-to) ${wallpaperClass}`}
      >
        <ChatboxHeader />
        <div className="laptop:h-[88dvh] laptop-lg:h-[90dvh] flex w-full">
          <div
            ref={refChatboxContainer}
            className={`relative flex w-full flex-col items-center
                    ${anyPanelOpen ? "" : "shrink-0"}`}
          >
            <Chatbox />
            <ChatInput className="chatbox" />
          </div>
        </div>
      </div>
      <div
        className={`border-l-(--border-color) relative h-full shrink-0 origin-right border-l-[.1rem] transition-all duration-200
          ${anyPanelOpen ? "sidebar-w" : "w-0"}`}
      >
        <Information />
        <Attachment />
        <InformationSearch />
        <InformationBookmark />
        <InformationPin />
      </div>
    </div>
  );
};

export default ChatboxContainer;
