import HttpRequest from "../lib/fetch";
import {
  ContactModel,
  CreateDirectChatReq,
  CreateDirectChatRes,
  FriendCache,
  FriendSuggestion,
} from "../types/friend.types";

export const createDirectChat = async (contactId: string) => {
  return (
    await HttpRequest<undefined, CreateDirectChatRes>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_CREATE_DIRECT.replace(
        "{contact-id}",
        contactId,
      ),
    })
  ).data;
};

// Tra id hội thoại trực tiếp đã tồn tại với contact (null nếu chưa có). Đọc-thuần,
// không tạo mới — dùng để tránh quét toàn bộ danh sách chat khi tìm hội thoại.
export const getDirectConversationId = async (contactId: string) => {
  const data = (
    await HttpRequest<undefined, { conversationId?: string | null }>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_GET_DIRECT_ID.replace(
        "{contact-id}",
        contactId,
      ),
    })
  ).data;
  return data?.conversationId ?? null;
};

export const createDirectChatWithMessage = async (
  contactId: string,
  request: CreateDirectChatReq,
) => {
  return (
    await HttpRequest<CreateDirectChatReq, CreateDirectChatRes>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_CREATE_DIRECT_WITH_MESSAGE.replace(
        "{contact-id}",
        contactId,
      ),
      data: request,
    })
  ).data;
};

export const getContacts = async (name: string) => {
  return (
    await HttpRequest<undefined, ContactModel[]>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_CONTACT_GETBYNAME.replace(
        "{name}",
        name,
      ),
    })
  ).data;
};

// Xoá quan hệ bạn bè qua DELETE /friends/{id} — dùng chung cho deny lời mời & unfriend.
export const removeFriend = async (friendId: string) => {
  return (
    await HttpRequest({
      method: "delete",
      url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_GETBYID.replace(
        "{id}",
        friendId,
      ),
    })
  ).data;
};

export const getFriendSuggestions = async (
  limit = 10,
): Promise<FriendSuggestion[]> => {
  return (
    (
      await HttpRequest<undefined, FriendSuggestion[]>({
        method: "get",
        url: `${import.meta.env.VITE_ENDPOINT_FRIEND_SUGGESTIONS}?limit=${limit}`,
      })
    ).data ?? []
  );
};

export const getFriends = async (): Promise<FriendCache[]> => {
  return (
    (
      await HttpRequest<undefined, FriendCache[]>({
        method: "get",
        url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_GET,
        // Endpoint poll presence định kỳ: ép revalidate, tránh browser/ngrok trả response cache
        // khiến isOnline đứng yên dù đã refetch.
        headers: { "Cache-Control": "no-cache" },
      })
    ).data ?? []
  );
};
