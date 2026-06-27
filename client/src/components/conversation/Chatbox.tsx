import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef } from "react";
import { useChatboxScroll } from "../../hooks/useChatboxScroll";
import useConversation from "../../hooks/useConversation";
import useInfo from "../../hooks/useInfo";
import useMessage from "../../hooks/useMessage";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import { ConversationCache } from "../../types/conv.types";
import {
  GroupedMessage,
  PendingMessageModel,
  SeenContact,
} from "../../types/message.types";
import { formatDate, formatDisplayDate } from "../../utils/datetime";
import { markConversationSeen } from "../../utils/notificationCacheHelpers";
import RelightBackground from "../common/RelightBackground";
import MessageContent from "../message/MessageContent";
import { markRead } from "../../services/message.service";

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
  const { messageId: targetMessageId } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: conversations } = useConversation();
  const conversation = conversations?.conversations?.find((c) => c.id === conversationId);

  const { data: info } = useInfo();

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

  // Nhảy tới + highlight 1 tin cụ thể khi có ?messageId (vd click banner reaction).
  // Mỗi message render với id={message.id} (MessageContent) → getElementById tìm DOM.
  // Tin có thể chưa render xong (async) → retry vài nhịp; tin quá cũ chưa load → no-op
  // (graceful, vẫn ở trong hội thoại). Clear param sau khi nhảy để không lặp lại.
  useEffect(() => {
    if (!targetMessageId) return;
    let cancelled = false;
    let attempts = 0;

    const tryScroll = () => {
      if (cancelled) return;
      const el = document.getElementById(targetMessageId);
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        el.classList.add("message-highlight");
        setTimeout(() => el.classList.remove("message-highlight"), 2200);
        navigate({
          to: "/conversations/$conversationId",
          params: { conversationId },
          search: {},
          replace: true,
        });
        return;
      }
      if (attempts++ < 10) setTimeout(tryScroll, 250);
    };

    const t = setTimeout(tryScroll, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [targetMessageId, conversationId, navigate]);

  // Gửi read receipt khi người dùng đọc tin nhắn (ở đáy màn hình)
  useEffect(() => {
    if (!messages || messages.messages.length === 0 || !conversationId) return;
    
    // Nếu không hiện nút cuộn xuống nghĩa là đã ở cuối cùng
    if (!showScrollToBottom) {
      const currentLastMsg = messages.messages[messages.messages.length - 1];
      const timer = setTimeout(() => {
        if (currentLastMsg && currentLastMsg.id) {
          markRead(conversationId, currentLastMsg.id).catch(console.error);
          // Clear unSeen ngay tại thời điểm đọc tin cuối → badge khớp list, tự sửa
          // race "tin đến lúc đang xem nhưng isConversationActive=false → unSeen=true".
          queryClient.setQueryData(["conversation"], (old: ConversationCache) =>
            old ? markConversationSeen(old, conversationId) : old,
          );
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showScrollToBottom, messages, conversationId, queryClient]);

  const grouped = groupMessagesByDate(messages?.messages ?? []);
  const groupedEntries = Object.entries(grouped);

  /**
   * Rule sản phẩm: CHỈ hiển thị trạng thái tin nhắn (avatar người xem hoặc
   * icon Sent/Delivered) khi tin nhắn CUỐI CÙNG của conversation là của mình.
   * Nếu tin cuối là của người khác → KHÔNG hiển thị bất kỳ status nào.
   *
   * Pending message của mình cũng không thoả (chưa confirmed → chưa có id thật).
   */
  const allMessages = messages?.messages ?? [];
  const lastMessage =
    allMessages.length > 0 ? allMessages[allMessages.length - 1] : null;
  const lastMessageIsMineConfirmed =
    !!lastMessage &&
    !!lastMessage.id &&
    lastMessage.contactId === info?.id &&
    !lastMessage.pending;
  const lastMyMessageId = lastMessageIsMineConfirmed
    ? (lastMessage?.id ?? null)
    : null;

  /**
   * Map: messageId -> danh sách contact đã xem tin cuối (chỉ khi tin cuối là của mình).
   *
   * Vì rule chỉ cho hiện status ở tin cuối của conversation (và phải là của mình),
   * nên map này tối đa chỉ có 1 entry duy nhất là `lastMessage.id`.
   *
   * - Nếu tin cuối không phải của mình / pending / không tồn tại → map rỗng.
   * - Nếu tin cuối là của mình: avatar hiển thị cho các member khác có
   *   `lastSeenTime >= lastMessage.createdTime` (đã đọc tới tin cuối).
   *
   * Complexity: O(m) với m = số member khác trong conversation.
   */
  const seenContactsByMessageId = useMemo<Record<string, SeenContact[]>>(() => {
    const result: Record<string, SeenContact[]> = {};
    if (
      !lastMessageIsMineConfirmed ||
      !lastMessage?.id ||
      !lastMessage?.createdTime ||
      !info?.id
    ) {
      return result;
    }

    const otherMembers = (conversation?.members ?? []).filter(
      (m) => m.contact?.id && m.contact.id !== info.id && m.lastSeenTime,
    );
    if (otherMembers.length === 0) return result;

    const lastTime = dayjs(lastMessage.createdTime).valueOf();
    const lastId = lastMessage.id;

    for (const member of otherMembers) {
      const seenTime = dayjs(member.lastSeenTime!).valueOf();
      // Chỉ tính là "đã xem tin cuối" khi lastSeenTime >= createdTime của tin cuối
      if (seenTime >= lastTime) {
        if (!result[lastId]) result[lastId] = [];
        result[lastId].push(member.contact!);
      }
    }

    return result;
  }, [
    lastMessageIsMineConfirmed,
    lastMessage?.id,
    lastMessage?.createdTime,
    conversation?.members,
    info?.id,
  ]);

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
                      isLastFromMe={
                        lastMyMessageId !== null && message.id === lastMyMessageId
                      }
                      // Pre-computed: tin này là điểm dừng đọc cuối của các member nào
                      seenContacts={
                        message.id ? seenContactsByMessageId[message.id] : undefined
                      }
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
