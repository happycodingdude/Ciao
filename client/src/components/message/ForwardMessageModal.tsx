import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import useConversation from "../../hooks/useConversation";
import useFriend from "../../hooks/useFriend";
import useInfo from "../../hooks/useInfo";
import { createDirectChatWithMessage } from "../../services/friend.service";
import { sendMessage } from "../../services/message.service";
import { ConversationCache, ConversationModel } from "../../types/conv.types";
import { ContactModel } from "../../types/friend.types";
import {
  AttachmentCache,
  MessageCache,
  PendingMessageModel,
  SendMessageRequest,
  SendMessageResponse,
} from "../../types/message.types";
import { getToday } from "../../utils/datetime";
import delay from "../../utils/delay";
import { isPhoneScreen } from "../../utils/getScreenSize";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import ListFriendLoading from "../common/ListFriendLoading";

const ForwardMessageModal = ({
  message,
  forward,
  directContact,
}: {
  message: PendingMessageModel;
  forward: boolean;
  directContact?: string;
}) => {
  const { type, content, attachments } = message;

  const queryClient = useQueryClient();

  const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  const { data, isLoading, isRefetching } = useFriend();

  const refInput = useRef<HTMLInputElement>();

  const [membersToSearch, setMembersToSearch] = useState<ContactModel[]>(
    data
      ?.filter((item) => item.contact.id !== directContact)
      .map((item) => item.contact),
  );
  const [sentIds, setSentIds] = useState<Set<string>>(new Set()); // ✅ lưu các contact đang gửi

  useEffect(() => {
    if (!data) return;
    setMembersToSearch(
      data
        .filter((item) => item.contact.id !== directContact)
        .map((item) => item.contact),
    );
    refInput.current.focus();
    // blurImage(".list-friend-container");
  }, [data]);

  const send = async (contact: ContactModel) => {
    setSentIds((prev) => new Set(prev).add(contact.id)); // thêm id vào state

    // onClose();
    const randomId = Math.random().toString(36).substring(2, 7);
    const existedConversation = conversations.conversations.find(
      (conv) =>
        conv.isGroup === false &&
        conv.members.some((mem) => mem.contact.id === contact.id) &&
        conv.members.some((mem) => mem.contact.id === info.id),
    );
    if (existedConversation) {
      await handleExistedConversation(existedConversation);
    } else {
      await handleNewConversation(contact, randomId);
    }
  };

  const handleExistedConversation = async (conversation: ConversationModel) => {
    queryClient.setQueryData<ConversationCache>(["conversation"], (oldData) => {
      if (!oldData) return oldData;

      const now = dayjs().format();
      const convs = oldData.conversations ?? [];

      // Lấy conversation hiện tại từ cache (tránh dùng `conversation` "bên ngoài" nếu nó stale)
      const cachedConv =
        convs.find((c) => c.id === conversation.id) ?? conversation;

      const isDeletedConversation =
        cachedConv.members.find((mem) => mem.contact.id === info.id)
          ?.isDeleted ?? false;

      let updatedConversations: ConversationModel[];

      if (isDeletedConversation) {
        const updatedConv: ConversationModel = {
          ...cachedConv,
          lastMessage:
            attachments && attachments.length > 0 && !content
              ? attachments.map((att) => att.mediaName).join(",")
              : content,
          // tạo members mới (immutable)
          members: cachedConv.members.map((mem) =>
            mem.contact.id === info.id ? { ...mem, isDeleted: false } : mem,
          ),
        };

        // đặt conversation cập nhật lên đầu (tạo array mới)
        updatedConversations = [
          updatedConv,
          ...convs.filter((c) => c.id !== cachedConv.id),
        ];
      } else {
        updatedConversations = convs.map((c) =>
          c.id !== cachedConv.id
            ? c
            : {
                ...c,
                lastMessage:
                  attachments && attachments.length > 0 && !content
                    ? attachments.map((att) => att.mediaName).join(",")
                    : content,
                lastMessageTime: now,
                members: c.members.map((mem) =>
                  mem.contact.id === info.id
                    ? { ...mem, isDeleted: false }
                    : mem,
                ),
              },
        );
      }

      return {
        ...oldData,
        conversations: updatedConversations,
        filterConversations: updatedConversations,
      } as ConversationCache;
    });

    const randomId: string = Math.random().toString(36).substring(2, 7);
    const hasMedia: boolean = attachments && attachments.length > 0;
    queryClient.setQueryData(
      ["message", conversation.id],
      (oldData: MessageCache) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          messages: [
            ...(oldData.messages || []),
            {
              id: randomId,
              type: type,
              content: content,
              contactId: info.id,
              attachments: hasMedia ? attachments : [],
              pending: true,
              likeCount: 0,
              loveCount: 0,
              careCount: 0,
              wowCount: 0,
              sadCount: 0,
              angryCount: 0,
              currentReaction: null,
              createdTime: dayjs().format(),
              isForwarded: forward,
            } as PendingMessageModel,
          ],
        } as MessageCache;
      },
    );
    if (hasMedia) {
      queryClient.setQueryData(
        ["attachment", conversation.id],
        (oldData: AttachmentCache) => {
          if (!oldData) return oldData;

          const today = getToday("MM/DD/YYYY");
          // Nếu chưa có attachment nào trong cache
          if (!oldData?.attachments) {
            return {
              ...oldData,
              attachments: [
                {
                  date: today,
                  attachments: attachments,
                },
              ],
            } as AttachmentCache;
          }
          // Kiểm tra xem đã có attachment cho ngày hôm nay chưa
          const existingItem = oldData.attachments.find(
            (item) => item.date === today,
          );
          // Nếu chưa có thì thêm mới
          if (!existingItem) {
            return {
              ...oldData,
              attachments: [
                ...oldData.attachments,
                {
                  date: today,
                  attachments: attachments,
                },
              ],
            } as AttachmentCache;
          }
          // Nếu có rồi thì chỉ cần thêm vào danh sách attachments của ngày hôm nay
          return {
            ...oldData,
            attachments: oldData.attachments.map((item) =>
              item.date === today
                ? {
                    ...item,
                    attachments: [...attachments, ...item.attachments],
                  }
                : item,
            ),
          } as AttachmentCache;
        },
      );
    }

    const bodyToCreate: SendMessageRequest = {
      type: type,
      content: content,
      attachments: attachments,
      isForwarded: forward,
    };
    const res: SendMessageResponse = await sendMessage(
      conversation.id,
      bodyToCreate,
    );
    await delay(500);

    queryClient.setQueryData(
      ["message", conversation.id],
      (oldData: MessageCache) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          messages: oldData.messages.map((message) => {
            if (message.id !== randomId) return message;
            return {
              ...message,
              id: res.messageId,
              pending: false,
            };
          }),
        } as MessageCache;
      },
    );
  };

  const handleNewConversation = async (
    contact: ContactModel,
    randomId: string,
  ) => {
    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      const newConversation: ConversationModel = {
        id: randomId,
        lastMessage:
          attachments && attachments.length > 0 && !content
            ? attachments.map((att) => att.mediaName).join(",")
            : content,
        isGroup: false,
        isNotifying: true,
        members: [
          {
            isModerator: true,
            contact: {
              id: info.id,
              name: info.name,
              avatar: info.avatar,
              isOnline: true,
            },
          },
          {
            contact: {
              id: contact.id,
              name: contact.name,
              avatar: contact.avatar,
              isOnline: contact.isOnline,
            },
          },
        ],
      };
      return {
        ...oldData,
        conversations: [newConversation, ...oldData.conversations],
        filterConversations: [newConversation, ...oldData.conversations],
        reload: false,
      } as ConversationCache;
    });

    createDirectChatWithMessage(contact.id, {
      message: content,
      isForwarded: forward,
    }).then((res) => {
      queryClient.setQueryData(
        ["conversation"],
        (oldData: ConversationCache) => {
          const updatedConversations = oldData.conversations.map(
            (conversation) => {
              if (conversation.id !== randomId) return conversation;
              return { ...conversation, id: res.conversationId };
            },
          );
          return {
            ...oldData,
            conversations: updatedConversations,
            filterConversations: updatedConversations,
          } as ConversationCache;
        },
      );

      const hasMedia: boolean = attachments && attachments.length > 0;
      queryClient.setQueryData(
        ["message", res.conversationId],
        (oldData: MessageCache) => {
          return {
            messages: [
              {
                id: res.messageId,
                type: type,
                content: content,
                contactId: info.id,
                attachments: hasMedia ? attachments : [],
                pending: false,
                likeCount: 0,
                loveCount: 0,
                careCount: 0,
                wowCount: 0,
                sadCount: 0,
                angryCount: 0,
                currentReaction: null,
                createdTime: dayjs().format(),
                isForwarded: forward,
              } as PendingMessageModel,
            ],
          } as MessageCache;
        },
      );
      if (hasMedia) {
        queryClient.setQueryData(
          ["attachment", res.conversationId],
          (oldData: AttachmentCache) => {
            return {
              attachments: [
                {
                  date: getToday("MM/DD/YYYY"),
                  attachments: attachments,
                },
              ],
            } as AttachmentCache;
          },
        );
      }
    });
  };

  return (
    <>
      <CustomInput
        type="text"
        placeholder="Search for name"
        inputRef={refInput}
        onChange={(e) => {
          if (e.target.value === "")
            setMembersToSearch(data.map((item) => item.contact));
          else
            setMembersToSearch((current) => {
              const found = current.filter((item) =>
                item.name.toLowerCase().includes(e.target.value.toLowerCase()),
              );

              return found;
            });
        }}
      />
      <div
        className={`relative flex grow gap-8
      ${isPhoneScreen() ? "flex-col" : "flex-row"} `}
      >
        {isLoading || isRefetching ? (
          <ListFriendLoading />
        ) : (
          <>
            <div className="list-friend-container hide-scrollbar mt-4 flex grow flex-col overflow-y-scroll scroll-smooth">
              {membersToSearch?.map((item) => {
                const isSent = sentIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`information-members flex w-full items-center gap-4 rounded-lg p-[.7rem]`}
                  >
                    <ImageWithLightBoxAndNoLazy
                      src={item.avatar}
                      className="phone:w-12 laptop:w-16 pointer-events-none aspect-square"
                      circle
                      slides={[
                        {
                          src: item.avatar,
                        },
                      ]}
                      onClick={() => {}}
                      local
                    />
                    <CustomLabel
                      title={item.name}
                      className="pointer-events-none"
                    />
                    <CustomButton
                      className={`text-2xs ${isSent ? "pointer-events-none opacity-50" : ""}`}
                      width={4}
                      gradientWidth={`${isPhoneScreen() ? "115%" : "110%"}`}
                      gradientHeight={`${isPhoneScreen() ? "130%" : "120%"}`}
                      rounded="3rem"
                      title="Send"
                      onClick={() => send(item)}
                      sm
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ForwardMessageModal;
