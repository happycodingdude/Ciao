import { useEffect, useRef } from "react";
import { useChatboxScroll } from "../../hooks/useChatboxScroll";
import useConversation from "../../hooks/useConversation";
import useMessage from "../../hooks/useMessage";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import { GroupedMessage, PendingMessageModel } from "../../types/message.types";
import { formatDate, formatDisplayDate } from "../../utils/datetime";
import RelightBackground from "../common/RelightBackground";
import MessageContent from "../message/MessageContent";

// Gom tin nhắn thành nhóm theo ngày, rồi trong mỗi ngày gom tiếp theo người gửi liên tiếp
const groupMessagesByDate = (
  messages: PendingMessageModel[],
): Record<string, GroupedMessage[]> =>
  messages.reduce(
    (groups, msg) => {
      const date = formatDate(msg.createdTime ?? "");
      if (!groups[date]) groups[date] = [];
      const dateGroups = groups[date];
      const lastGroup = dateGroups[dateGroups.length - 1];
      if (lastGroup && lastGroup.contactId === msg.contactId) {
        // Cùng người gửi liên tiếp → gom vào block hiện tại (hiển thị avatar/tên một lần)
        lastGroup.messages.push(msg);
      } else {
        // Người gửi khác → tạo block mới
        dateGroups.push({ contactId: msg.contactId ?? "", messages: [msg] });
      }
      return groups;
    },
    {} as Record<string, GroupedMessage[]>,
  );

const Chatbox = () => {
  const { conversationId } = Route.useParams();
  const { data: conversations } = useConversation();
  const conversation = conversations?.conversations?.find((c) => c.id === conversationId);

  const refPage = useRef<number>(1);
  const { data: messages } = useMessage(conversationId, refPage.current);

  const oldLastMsgRef = useRef<PendingMessageModel | null>(null);
  const isInitialLoad = useRef(true);

  const { refChatContent, bottomRef, scrollToBottom, showScrollToBottom } =
    useChatboxScroll(conversationId, messages, refPage);

  // Reset state khi chuyển sang conversation khác
  useEffect(() => {
    refPage.current = 1;
    isInitialLoad.current = true;
    oldLastMsgRef.current = null;
    if (refChatContent.current) {
      // Tắt smooth scroll trước khi reset để không animate khi jump về đầu
      refChatContent.current.style.scrollBehavior = "auto";
    }
  }, [conversationId]);

  useEffect(() => {
    // Không làm gì nếu chưa có tin nhắn
    if (!messages || messages.messages.length === 0) return;
    const container = refChatContent.current;
    const currentLastMsg = messages.messages[messages.messages.length - 1];

    if (isInitialLoad.current) {
      if (container) {
        // Lần đầu load: jump thẳng xuống đáy không có animation
        container.style.scrollBehavior = "auto";
        container.scrollTop = container.scrollHeight;
      }
      isInitialLoad.current = false;
      requestAnimationFrame(() => {
        // Sau khi jump xong → bật lại smooth scroll cho các lần scroll sau
        if (container) container.style.scrollBehavior = "smooth";
      });
    } else if (currentLastMsg?.id !== oldLastMsgRef.current?.id) {
      // Có tin nhắn mới (id thay đổi) → scroll xuống đáy để xem tin mới nhất
      scrollToBottom("smooth");
    }

    oldLastMsgRef.current = currentLastMsg;
  }, [messages]);

  const grouped = groupMessagesByDate(messages?.messages ?? []);
  const groupedEntries = Object.entries(grouped);

  return (
    <div className="chatbox-content relative flex h-full w-full flex-col justify-end overflow-hidden pb-4">
      <RelightBackground
        data-show={showScrollToBottom}
        onClick={() => scrollToBottom("smooth")}
        className={`absolute bottom-[5%] right-[50%] z-20 transition-all duration-200
            data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto
            data-[show=false]:opacity-0 data-[show=true]:opacity-100`}
      >
        <div className="fa fa-arrow-down"></div>
      </RelightBackground>
      <div
        ref={refChatContent}
        className="flex grow flex-col overflow-x-hidden overflow-y-scroll scroll-smooth p-4"
      >
        {groupedEntries.map(([date, blocks], groupIndex) => (
          <div
            key={date}
            // Group đầu tiên có mt-auto để đẩy nội dung xuống đáy khi ít tin nhắn
            className={`flex flex-col ${groupIndex === 0 ? "mt-auto" : ""}`}
          >
            <div className="text-3xs rounded-4xl laptop:mb-8 pointer-events-none mx-auto w-fit bg-white px-8 py-1 text-center shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
              {formatDisplayDate(date)}
            </div>
            {blocks.map((block, blockIndex) => {
              const firstMessage = block.messages[0];
              if (firstMessage.type === "system") {
                // Tin hệ thống (ai đó được thêm vào group, ...) → hiển thị dạng label ở giữa
                return (
                  <div
                    key={blockIndex}
                    className="rounded-4xl pointer-events-none mx-auto mb-8 w-fit bg-white px-8 py-1 text-center shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
                  >
                    {firstMessage.content}
                  </div>
                );
              }
              return (
                <div key={blockIndex} className="mb-6 flex flex-col gap-3">
                  {block.messages.map((message) => (
                    <MessageContent
                      key={message.id}
                      message={message}
                      id={conversation?.id ?? ""}
                      // Avatar và tên chỉ hiển thị ở tin đầu của block
                      showName={message === firstMessage}
                      showAvatar={message === firstMessage}
                      getContainerRect={() =>
                        refChatContent.current?.getBoundingClientRect() ?? new DOMRect()
                      }
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Chatbox;
