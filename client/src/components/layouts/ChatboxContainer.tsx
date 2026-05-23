import { useEffect, useRef } from "react";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import { ConversationCache } from "../../types/conv.types";
import queryClient from "../../utils/queryClient";
import Attachment from "../conversation/Attachment";
import Chatbox from "../conversation/Chatbox";
import ChatboxHeader from "../conversation/ChatboxHeader";
import ChatInput from "../conversation/ChatInput";
import Information from "../conversation/Information";
import InformationSearch from "../conversation/InformationSearch";

// Tracker phải SURVIVE qua remount của ChatboxContainer. Khi chuyển conversation có data
// fetch, route có thể unmount-remount component (Suspense/loader) → useRef sẽ reset null
// mỗi lần mount → first-mount check skip reset → toggle không default Information như mong
// muốn. Đặt module-scope `let` để giữ giá trị nguyên qua các lần remount trong cùng tab.
// Reset thực sự chỉ xảy ra khi user reload trang (script re-evaluate).
let prevConvId: string | null = null;

const ChatboxContainer = () => {
  const { activeDetail, setActiveDetail } = useChatDetailToggles();

  // anyPanelOpen = sidebar phải đang hiển thị panel nào đó.
  const anyPanelOpen = activeDetail !== null;

  const refChatboxContainer = useRef<HTMLDivElement>(null);

  const { conversationId } = Route.useParams();

  // Khi user chuyển conversation: default về panel Information bất kể đang ở panel nào.
  // KHÔNG chạy ở mount đầu của tab (prevConvId === null) — giữ nguyên activeDetail vừa
  // restore từ localStorage để refresh page không bị mất state user đang dùng.
  useEffect(() => {
    if (prevConvId !== null && prevConvId !== conversationId) {
      setActiveDetail("information");
    }
    prevConvId = conversationId;
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

  // Get conversation list from cache
  const conversationCache = queryClient.getQueryData<ConversationCache>([
    "conversation",
  ]);
  const conversation = conversationCache?.filterConversations?.find(
    (c) => c.id === conversationId,
  );

  return (
    // <>
    //   {isPhoneScreen() ? (
    //     <>
    //       <div
    //         className={`absolute h-full w-full bg-[var(--bg-color)]
    //         ${conversation && (!toggle || toggle === "" || toggle === "null") ? "z-[10]" : "z-0"}`}
    //       >
    //         <div className="flex h-full flex-col">
    //           <ChatboxHeader />
    //           <div className="flex w-full grow overflow-hidden">
    //             {loading ? (
    //               <LocalLoading className="!z-[11]" />
    //             ) : (
    //               <div
    //                 ref={refChatboxContainer}
    //                 className={`relative flex w-full grow flex-col items-center gap-[1rem] border-r-[.1rem] border-r-[var(--border-color)] pb-[1rem]
    //                   ${toggle && toggle !== "" && toggle !== "null" ? "" : "shrink-0"}`}
    //               >
    //                 <Chatbox />
    //                 <ChatInput className="chatbox" inputRef={refInput} />
    //               </div>
    //             )}
    //           </div>
    //         </div>
    //       </div>
    //       <div
    //         className={`relative h-full w-full shrink-0 origin-right transition-all duration-200
    //           ${!toggle || toggle === "" || toggle === "null" ? "z-0" : "z-[10]"}`}
    //       >
    //         <i
    //           className="fa-arrow-left fa absolute left-[2rem] top-[1rem] z-[11] flex cursor-pointer items-center justify-center p-[.5rem]
    //         text-xl transition-all duration-500"
    //           onClick={() => setToggle(null)}
    //         ></i>
    //         <Information />
    //         <Attachment />
    //       </div>
    //     </>
    //   ) : (
    //     <div className="flex h-full">
    //       <div className="flex w-full grow flex-col bg-primary-light">
    //         <ChatboxHeader />
    //         <div className="flex w-full laptop:h-[89dvh] laptop-md:h-[92dvh]">
    //           <div
    //             ref={refChatboxContainer}
    //             className={`relative flex w-full flex-col items-center gap-[1rem]
    //                 ${toggle && toggle !== "" && toggle !== "null" ? "" : "shrink-0"}`}
    //           >
    //             <Chatbox />
    //             <ChatInput className="chatbox" inputRef={refInput} />
    //           </div>
    //         </div>
    //       </div>
    //       <div
    //         className={`relative h-full shrink-0 origin-right border-l-[.1rem] border-l-[var(--border-color)] transition-all duration-200
    //                 ${!toggle || toggle === "" || toggle === "null" ? "w-0" : "laptop:w-[30rem]"}`}
    //       >
    //         <Information />
    //         <Attachment />
    //       </div>
    //     </div>
    //   )}
    // </>

    <div className="flex h-full">
      <div className="bg-linear-to-br flex w-full grow flex-col from-light-blue-50 to-light-blue-100">
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
      </div>
    </div>
  );
};

export default ChatboxContainer;
