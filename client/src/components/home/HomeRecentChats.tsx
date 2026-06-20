import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { ConversationModel } from "../../types/conv.types";
import { renderMessageWithMentions } from "../../utils/renderMention";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";

type Props = {
  conversations: ConversationModel[];
  selfId?: string;
  // Presence lấy từ friend list đã poll (Home), không dùng isOnline tĩnh trong conversation cache.
  onlineFriendIds: Set<string>;
};

const HomeRecentChats = ({ conversations, selfId, onlineFriendIds }: Props) => {
  return (
    <section className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-(--text-main-color) flex items-center gap-2 font-semibold">
          <i className="fa-solid fa-clock-rotate-left text-(--main-color-bold)" />
          Continue chatting
        </h2>
        <Link
          to="/conversations"
          className="text-(--main-color-bold) text-xs hover:underline"
        >
          See all
        </Link>
      </div>

      {conversations.length === 0 ? (
        <p className="text-(--text-main-color-blur) bg-(--bg-color-extrathin) flex flex-1 items-center justify-center rounded-2xl p-4 text-center text-sm">
          No conversations yet. Start chatting with your friends!
        </p>
      ) : (
        <div className="laptop:grid-cols-2 laptop:auto-rows-fr grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden">
          {conversations.map((item) => {
            // Direct chat → lấy thành viên còn lại để hiển thị avatar/tên
            const otherMember = (item.members ?? []).find(
              (m) => m.contact?.id !== selfId,
            );
            const isOnline = (item.members ?? []).some(
              (m) =>
                m.contact?.id !== selfId &&
                m.contact?.id != null &&
                onlineFriendIds.has(m.contact.id),
            );
            const title = item.isGroup
              ? item.title
              : otherMember?.contact?.name;
            const avatar = item.isGroup
              ? item.avatar
              : otherMember?.contact?.avatar;

            return (
              <Link
                key={item.id}
                to="/conversations/$conversationId"
                params={{ conversationId: item.id ?? "" }}
                className="bg-(--bg-color) hover:bg-(--bg-color-extrathin) border-(--border-color) flex items-center
                  gap-3 rounded-2xl border p-2.5 transition-colors"
              >
                <div className="relative shrink-0">
                  <ImageWithLightBoxAndNoLazy
                    src={avatar}
                    className="pointer-events-none aspect-square w-10"
                    circle
                    slides={[{ src: avatar ?? "" }]}
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 aspect-square w-3.5 rounded-full border-2 border-white
                      ${isOnline ? "bg-(--online-color)" : "bg-(--offline-color)"}`}
                  />
                </div>

                <div className="flex min-w-0 grow flex-col">
                  <CustomLabel
                    className="text-(--text-main-color) font-medium"
                    title={title}
                  />
                  {item.lastMessage && (
                    <p
                      className={`overflow-hidden text-ellipsis whitespace-nowrap text-xs ${
                        item.unSeen
                          ? "text-(--danger-text-color) font-medium"
                          : "text-(--text-main-color-blur)"
                      }`}
                    >
                      {item.hasAttachment && (
                        <span className="mr-1 grayscale">🖼️</span>
                      )}
                      {renderMessageWithMentions(item.lastMessage)}
                    </p>
                  )}
                </div>

                {item.lastMessageTime && (
                  <span className="text-(--text-main-color-blur) shrink-0 self-start text-[10px]">
                    {dayjs(item.lastMessageTime).fromNow()}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HomeRecentChats;
