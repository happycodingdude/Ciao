import HttpRequest from "../lib/fetch";
import {
  ConversationCache,
  ConversationModel,
  CreateGroupChatRequest,
  UpdateConversationRequest,
} from "../types/conv.types";
import { CONVERSATIONS_PAGE_LIMIT } from "../utils/conversationPaging";

export const updateConversation = async (model: UpdateConversationRequest) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_GETBYID.replace(
        "{id}",
        model.id,
      ),
      data: {
        title: model.title,
        avatar: model.avatar,
      },
    })
  ).data;
};

export const addMembers = async (id: string, members: string[]) => {
  return (
    await HttpRequest<string[], undefined>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_MEMBER_GET.replace("{id}", id),
      data: members,
    })
  ).data;
};

export const leaveConversation = async (id: string) => {
  return (
    await HttpRequest({
      method: "delete",
      url: import.meta.env.VITE_ENDPOINT_MEMBER_GET.replace("{id}", id),
    })
  ).data;
};

export const reopenMember = async (id: string) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_MEMBER_REOPEN.replace("{id}", id),
    })
  ).data;
};

export const createGroupChat = async (model: CreateGroupChatRequest) => {
  return await HttpRequest<CreateGroupChatRequest, string>({
    method: "post",
    url: import.meta.env.VITE_ENDPOINT_CONVERSATION_CREATE,
    data: model,
  });
};

// Phase 3 — ghim/bỏ ghim hội thoại (per-user).
export const pinConversation = async (id: string, pinned: boolean) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_PIN.replace(
        "{id}",
        id,
      ).replace("{pinned}", String(pinned)),
    })
  ).data;
};

// Phase 3 — hình nền + màu bong bóng riêng của user cho một hội thoại (key preset, null = mặc định).
export const updateConversationAppearance = async (
  id: string,
  wallpaper: string | null,
  bubbleColor: string | null,
) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_APPEARANCE.replace(
        "{id}",
        id,
      ),
      data: { wallpaper, bubbleColor },
    })
  ).data;
};

// Phase 3 — đặt/xóa biệt danh member trong hội thoại (nickname rỗng/null = xóa).
export const updateMemberNickname = async (
  conversationId: string,
  contactId: string,
  nickname: string | null,
) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_MEMBER_NICKNAME.replace(
        "{conversationId}",
        conversationId,
      ).replace("{contactId}", contactId),
      data: { nickname },
    })
  ).data;
};

export const getConversations = async (page: number) => {
  const data = (
    await HttpRequest<undefined, ConversationModel[]>({
      method: "get",
      url:
        page === 1
          ? import.meta.env.VITE_ENDPOINT_CONVERSATION_GET
          : import.meta.env.VITE_ENDPOINT_CONVERSATION_GETWITHPAGING.replace(
              "{page}",
              page,
            ),
    })
  ).data;
  const result: ConversationCache = {
    conversations: data,
    filterConversations: data,
    page,
    // Trang trả về ít hơn limit → đây là trang cuối, khỏi tốn 1 call trả rỗng
    hasMore: (data?.length ?? 0) >= CONVERSATIONS_PAGE_LIMIT,
  };
  return result;
};
