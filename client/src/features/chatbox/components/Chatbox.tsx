import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import debounce from "lodash-es/debounce";
import { useCallback, useEffect, useRef, useState } from "react";
import RelightBackground from "../../../components/RelightBackground";
import useEventListener from "../../../hooks/useEventListener";
import { formatDate, formatDisplayDate } from "../../../utils/datetime";
import useConversation from "../../listchat/hooks/useConversation";
import { MessageCache, PendingMessageModel } from "../../listchat/types";
import useMessage from "../hooks/useMessage";
import getMessages from "../services/getMessages";
import MessageContent from "./MessageContent";
const Chatbox = () => {
  const queryClient = useQueryClient();

  const { data: conversations } = useConversation();
  // if (!conversations) return null; // Tránh render khi chưa có dữ liệu cần thiết

  const { conversationId } = useParams({
    from: "/conversations/_layout/$conversationId",
  });
  const conversation = conversations.conversations.find(
    (c) => c.id === conversationId,
  );

  const refPage = useRef<number>(1);
  const { data: messages } = useMessage(conversationId, refPage.current);

  const refChatContent = useRef<HTMLDivElement>();
  const bottomRef = useRef<HTMLDivElement>();
  const oldLastMsgRef = useRef(null);
  const isInitialLoad = useRef(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const scrollChatContentToBottom = (behavior: ScrollBehavior) => {
    console.log("behavior: " + behavior);

    bottomRef.current?.scrollIntoView({
      behavior: behavior as ScrollBehavior,
      block: "end",
    });
  };

  // 1. Reset về trang 1 khi đổi hội thoại (Không cần scroll ở đây)
  useEffect(() => {
    refPage.current = 1;
    isInitialLoad.current = true;
    oldLastMsgRef.current = null;

    // Tắt smooth ngay lập tức khi vừa đổi ID để chuẩn bị cho dữ liệu (dù là cache)
    if (refChatContent.current) {
      refChatContent.current.style.scrollBehavior = "auto";
    }
  }, [conversationId]);

  // 2. Theo dõi khi danh sách Tin nhắn thay đổi
  useEffect(() => {
    if (!messages || messages.messages.length === 0) return;

    const container = refChatContent.current;
    const currentLastMsg = messages.messages[messages.messages.length - 1];

    // TRƯỜNG HỢP 1: Lần đầu tiên vào phòng chat (Initial Load)
    if (isInitialLoad.current) {
      // Trường hợp lần đầu nạp (kể cả từ cache):
      // Ép cuộn tức thì bằng cách gán scrollTop
      if (container) {
        container.style.scrollBehavior = "auto"; // Đảm bảo chắc chắn là auto
        container.scrollTop = container.scrollHeight;
      }

      isInitialLoad.current = false;

      // Chỉ bật smooth lên SAU KHI đã nhảy xuống đáy xong
      // Dùng requestAnimationFrame để đảm bảo trình duyệt đã vẽ xong vị trí đáy
      requestAnimationFrame(() => {
        if (container) {
          container.style.scrollBehavior = "smooth";
        }
      });
    }
    // TRƯỜNG HỢP 2: Có tin nhắn mới xuất hiện ở cuối danh sách
    else if (currentLastMsg?.id !== oldLastMsgRef.current?.id) {
      // Có tin nhắn mới: Cuộn mượt
      // Lúc này container đã có smooth từ bước trên
      scrollChatContentToBottom("smooth");
    }
    // TRƯỜNG HỢP 3: Tải thêm tin nhắn cũ (Pagination)
    // Nếu currentLastMsg.id giống với oldLastMsgRef.id,
    // nghĩa là tin nhắn cũ được thêm vào đầu mảng -> Không làm gì cả để giữ vị trí cuộn.

    // Cập nhật lại Ref để so sánh cho lần sau
    oldLastMsgRef.current = currentLastMsg;
  }, [messages]);

  const fetchMoreMessage = async (conversationId: string) => {
    // Kiểm tra hasMore trực tiếp từ cache hiện tại của queryClient để tránh closure bug
    const currentData: MessageCache = queryClient.getQueryData([
      "message",
      conversationId,
    ]);
    if (!currentData?.hasMore || !refChatContent.current) return;

    const currentScrollHeight = refChatContent.current.scrollHeight;

    const newMessages = await getMessages(conversationId, refPage.current);

    queryClient.setQueryData(
      ["message", conversationId],
      (oldData: MessageCache) => {
        return {
          ...oldData,
          messages: [...newMessages.messages, ...oldData.messages],
          hasMore: newMessages.hasMore,
        };
      },
    );

    isFetching.current = false; // Mở khóa sau khi fetch xong

    requestAnimationFrame(() => {
      refChatContent.current.style.scrollBehavior = "auto";
      refChatContent.current.scrollTop =
        refChatContent.current.scrollHeight - currentScrollHeight;
      refChatContent.current.style.scrollBehavior = "smooth";
    });
  };

  const debounceFetch = useCallback(debounce(fetchMoreMessage, 100), []);

  const isFetching = useRef(false); // Quan trọng: Tránh gọi trùng lặp
  const handleScroll = useCallback(() => {
    const contentEl = refChatContent.current;
    if (!contentEl || isFetching.current || !messages || !conversation) return;

    // 1. Logic hiện nút Scroll To Bottom (Giữ nguyên của bạn)
    const distanceFromBottom =
      contentEl.scrollHeight - (contentEl.scrollTop + contentEl.clientHeight);
    setShowScrollToBottom(
      contentEl.clientHeight !== 0 &&
        distanceFromBottom >= contentEl.clientHeight / 2,
    );

    // 2. Logic Load More (Scroll Up)
    // Thay vì 1/4, dùng khoảng cách 300px từ đỉnh để ổn định hơn
    const isNearTop = contentEl.scrollTop <= 300;

    if (isNearTop && messages.hasMore) {
      isFetching.current = true; // Khóa lại
      refPage.current += 1;

      debounceFetch(conversation.id);
    }
  }, [debounceFetch, conversation?.id]);
  // const handleScroll = useCallback(() => {
  //   const contentEl = refChatContent.current;
  //   if (!contentEl) return;

  //   const distanceFromBottom =
  //     contentEl.scrollHeight - (contentEl.scrollTop + contentEl.clientHeight);

  //   // Hiển thị nút scroll to bottom nếu khoảng cách từ đáy lớn hơn nửa chiều cao khung nhìn
  //   setShowScrollToBottom(
  //     contentEl.clientHeight !== 0 &&
  //       distanceFromBottom >= contentEl.clientHeight / 2,
  //   );

  //   // Load thêm khi scroll được khoảng 1/4 chiều cao khung nhìn từ trên xuống
  //   if (contentEl.scrollTop <= contentEl.clientHeight / 4) {
  //     refPage.current += 1;

  //     debounceFetch(conversation?.id, messages?.hasMore);
  //   }
  // }, [messages?.hasMore, debounceFetch, conversation?.id]);

  useEventListener("scroll", handleScroll, refChatContent.current);

  const groupMessagesByDate = (
    messages: PendingMessageModel[],
  ): Record<string, PendingMessageModel[]> => {
    return messages.reduce(
      (groups, msg) => {
        const date = formatDate(msg.createdTime);
        if (!groups[date]) groups[date] = [];
        groups[date].push(msg);
        return groups;
      },
      {} as Record<string, PendingMessageModel[]>,
    );
  };

  const grouped = groupMessagesByDate(messages?.messages ?? []);
  const groupedEntries = Object.entries(grouped);

  return (
    <div className="chatbox-content relative flex h-full w-full flex-col justify-end overflow-hidden pb-4">
      <RelightBackground
        data-show={showScrollToBottom}
        onClick={() => scrollChatContentToBottom("smooth")}
        className={`absolute bottom-[5%] right-[50%] z-20 transition-all duration-200
            data-[show=false]:pointer-events-none data-[show=true]:pointer-events-auto 
            data-[show=false]:opacity-0 data-[show=true]:opacity-100`}
      >
        <div className="fa fa-arrow-down"></div>
      </RelightBackground>
      <div
        ref={refChatContent}
        className="custom-scrollbar flex grow flex-col overflow-x-hidden overflow-y-scroll scroll-smooth p-4"
      >
        {groupedEntries.map(([date, messages], groupIndex) => (
          <div
            key={date}
            className={`flex flex-col 
              ${groupIndex === 0 ? "mt-auto" : ""} `}
          >
            {/* Ngày hiển thị giữa */}
            <div className="text-3xs rounded-4xl pointer-events-none mx-auto w-fit bg-white px-8 py-1 text-center shadow-[0_2px_10px_rgba(0,0,0,0.1)] laptop-lg:mb-8">
              {formatDisplayDate(date)}
            </div>

            {[...messages].map((message, index) => {
              return message.type === "system" ? (
                <div className="rounded-4xl pointer-events-none mx-auto w-fit bg-white px-8 py-1 text-center shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                  {message.content}
                </div>
              ) : (
                <MessageContent
                  message={message}
                  id={conversation.id}
                  getContainerRect={() =>
                    refChatContent.current?.getBoundingClientRect()
                  }
                />
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
