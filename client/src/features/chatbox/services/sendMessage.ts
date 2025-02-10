import HttpRequest from "../../../lib/fetch";
import { SendMessageRequest } from "../types";

const sendMessage = async (id: string, data: SendMessageRequest) => {
  return (
    await HttpRequest<SendMessageRequest, string>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_SEND.replace(
        "{conversationId}",
        id,
      ),
      data: data,
      // timeout: 500,
    })
  ).data;
};

export default sendMessage;
