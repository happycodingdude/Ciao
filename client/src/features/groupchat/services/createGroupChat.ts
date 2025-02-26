import HttpRequest from "../../../lib/fetch";

export type CreateGroupChatRequest = {
  title: string;
  avatar?: string;
  members: string[];
};

const createGroupChat = async (model: CreateGroupChatRequest) => {
  return await HttpRequest<CreateGroupChatRequest, string>({
    method: "post",
    url: import.meta.env.VITE_ENDPOINT_CONVERSATION_CREATE,
    data: model,
  });
};
export default createGroupChat;
