import HttpRequest from "../lib/fetch";
import {
  ConversationCache,
  ConversationModel,
  CreateGroupChatRequest,
  UpdateConversationRequest,
} from "../types/conv.types";

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
    // selected: null,
  };
  return result;
};
