import { HttpRequest } from "../../../lib/fetch";

const sendMessage = async (id, data) => {
  return (
    await HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_SEND.replace(
        "{conversationId}",
        id,
      ),
      data: data,
      timeout: 500,
    })
  ).data;
};

export default sendMessage;
