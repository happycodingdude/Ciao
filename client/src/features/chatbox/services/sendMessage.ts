import HttpRequest from "../../../lib/fetch";
import { SendMessageRequest, SendMessageResponse } from "../types";

const sendMessage = async (
  id: string,
  data: SendMessageRequest,
  timeout?: number,
) => {
  return (
    await HttpRequest<SendMessageRequest, SendMessageResponse>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_SEND.replace(
        "{conversationId}",
        id,
      ),
      data: data,
      timeout: timeout,
    })
  ).data;
};

export default sendMessage;
