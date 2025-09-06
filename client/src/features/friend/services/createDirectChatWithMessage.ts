import HttpRequest from "../../../lib/fetch";
import { CreateDirectChatRes } from "../types";

const createDirectChatWithMessage = async (
  contactId: string,
  message: string,
) => {
  return (
    await HttpRequest<undefined, CreateDirectChatRes>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_CREATE_DIRECT_WITH_MESSAGE.replace(
        "{contact-id}",
        contactId,
      ).replace("{message}", message),
    })
  ).data;
};
export default createDirectChatWithMessage;
