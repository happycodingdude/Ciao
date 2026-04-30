import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import debounce from "lodash-es/debounce";
import { useCallback, useMemo, useRef } from "react";
import { useActiveConversation } from "../../hooks/useActiveConversation";
import useConversation from "../../hooks/useConversation";
import useEventListener from "../../hooks/useEventListener";
import useInfo from "../../hooks/useInfo";
import { getConversations } from "../../services/conv.service";
import "../../styles/listchat.css";
import { ConversationCache } from "../../types/conv.types";
import { renderMessageWithMentions } from "../../utils/renderMention";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import ListchatLoading from "../common/ListchatLoading";

const ListChatContainer = () => {
  console.log("Rendering ListChatContainer");
  const queryClient = useQueryClient();

  const activeConversationId = useActiveConversation();

  const { data: info } = useInfo();

  const { data: conversations, isLoading, isRefetching } = useConversation(1);
  if (isLoading || isRefetching) return <ListchatLoading />;

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const refListConversation = useRef<HTMLDivElement>();
  const refPage = useRef<number>(1);
  const isFetching = useRef(false); // Quan trọng: Tránh gọi trùng lặp khi scroll nhanh
  const refHasMore = useRef<boolean>(true);

  const lockScroll = (el: HTMLElement) => {
    const lockedTop = el.scrollTop;

    const preventScroll = (e: Event) => {
      e.preventDefault();
      el.scrollTop = lockedTop; // ép giữ nguyên vị trí
    };

    el.addEventListener("wheel", preventScroll, { passive: false });
    el.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      el.removeEventListener("wheel", preventScroll);
      el.removeEventListener("touchmove", preventScroll);
    };
  };

  const fetchMoreConversations = async () => {
    const el = refListConversation.current;

    // ✅ lock scroll ngay khi bắt đầu fetch
    const unlockScroll = lockScroll(el);

    const newConversations = await getConversations(refPage.current);

    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      return {
        ...oldData,
        conversations: [
          ...oldData.conversations,
          ...newConversations.conversations,
        ],
        filterConversations: [
          ...oldData.filterConversations,
          ...newConversations.filterConversations,
        ],
      };
    });

    refHasMore.current = newConversations.conversations.length > 0; // Cập nhật hasMore dựa trên kết quả trả về
    isFetching.current = false; // Mở khóa sau khi fetch xong

    // ✅ Restore đúng: preserve vị trí relative của user
    requestAnimationFrame(() => {
      // ✅ unlock sau khi restore scroll
      unlockScroll();
    });
  };

  // const debounceFetch = useCallback(debounce(fetchMoreMessage, 100), []);
  const debounceFetch = useMemo(
    () => debounce(fetchMoreConversations, 100),
    [fetchMoreConversations],
  );

  const handleScroll = useCallback(() => {
    const el = refListConversation.current;
    if (!el || isFetching.current || !conversations) return;

    const distanceFromBottom =
      el.scrollHeight - (el.scrollTop + el.clientHeight);

    if (distanceFromBottom <= 50 && refHasMore.current) {
      isFetching.current = true;
      refPage.current += 1;
      debounceFetch();
    }
  }, [debounceFetch]);

  useEventListener("scroll", handleScroll, refListConversation.current);

  const scrollToConversation = (id: string) => {
    const container = refListConversation.current;
    const item = itemRefs.current[id];

    if (!container || !item) return;

    const target =
      item.offsetTop - container.clientHeight / 2 + item.clientHeight / 2;

    container.scrollTo({
      top: target,
      behavior: "smooth",
    });
  };

  // const { conversationId } = Route.useParams();
  // useLayoutEffect(() => {
  //   if (!conversationId || !conversations?.filterConversations.length) return;

  //   // đợi DOM render xong rồi dùng lại hàm cũ
  //   requestAnimationFrame(() => {
  //     scrollToConversation(conversationId);
  //   });
  // }, [conversations, conversationId, scrollToConversation]);

  return (
    <div
      ref={refListConversation}
      className="relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-scroll scroll-smooth p-2"
    >
      {conversations?.filterConversations
        .filter((conv) =>
          conv.members.some(
            (mem) => mem.contact.id === info.id && !mem.isDeleted,
          ),
        )
        .map((item) => {
          const isActive = item.id === activeConversationId;

          return (
            <Link key={item.id} to={`/conversations/${item.id}`}>
              <div
                ref={(el) => (itemRefs.current[item.id] = el)}
                onClick={() => scrollToConversation(item.id)}
                className={`chat-item cursor-pointer rounded-2xl px-4 py-2 ${isActive ? "active" : ""}`}
              >
                <div className="laptop-lg:h-12 laptop:h-12 flex items-center justify-between">
                  <div className="relative">
                    {/* MARK: AVATAR */}
                    <ImageWithLightBoxAndNoLazy
                      src={
                        item.isGroup
                          ? item.avatar
                          : item.members.find(
                              (item) => item.contact.id !== info.id,
                            )?.contact.avatar
                      }
                      className="pointer-events-none aspect-square w-10 animate-morph"
                      circle
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 aspect-square w-4 rounded-full border-2 border-white 
                        ${item.members.some((mem) => mem.contact.isOnline && mem.contact.id !== info.id) ? "bg-(--online-color)" : "bg-(--offline-color)"}`}
                    ></div>
                  </div>
                  <div className="flex w-[60%] flex-col">
                    {/* MARK: TITLE */}
                    <CustomLabel
                      className="font-medium"
                      title={
                        item.isGroup
                          ? item.title
                          : item.members.find(
                              (item) => item.contact.id !== info.id,
                            )?.contact.name
                      }
                    />
                    {/* MARK: LAST MESSAGE */}
                    {item.lastMessage ? (
                      <div className="flex text-gray-600">
                        {item.hasAttachment && (
                          <span className="laptop:text-2xs mr-1 self-center text-gray-500 grayscale">
                            🖼️
                          </span>
                        )}
                        <p
                          className={`${
                            isActive
                              ? "text-(--text-sub-color-thin)"
                              : item.unSeen
                                ? "text-(--danger-text-color)"
                                : "text-(--text-main-color-blur)"
                          } w-full overflow-hidden text-ellipsis whitespace-nowrap`}
                        >
                          {renderMessageWithMentions(item.lastMessage)}
                        </p>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  {/* MARK: LAST MESSAGE TIME */}
                  <div
                    className={`laptop:text-4xs laptop:w-7 flex aspect-square flex-col items-center justify-center self-start rounded-full 
                        ${item.lastMessageTime === null ? "" : "bg-gray-100"} text-gray-500`}
                  >
                    <p>
                      {item.lastMessageTime === null
                        ? ""
                        : dayjs(item.lastMessageTime).fromNow()}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
    </div>
  );
};

export default ListChatContainer;
