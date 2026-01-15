import HttpRequest from "../../../lib/fetch";
import { CreateDirectChatReq, CreateDirectChatRes } from "../types";

const createDirectChatWithMessage = async (
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
export default createDirectChatWithMessage;
