import HttpRequest from "../../../lib/fetch";
import { CreateDirectChatRes } from "../types";

const createDirectChat = async (contactId: string) => {
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
export default createDirectChat;
