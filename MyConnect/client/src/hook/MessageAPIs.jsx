import { HttpRequest } from "../common/Utility";

const page = 1;
const limit = 10;

export const getMessages = async (conversationId) => {
  const messages = (
    await HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_GET.replace(
        "{id}",
        conversationId,
      )
        .replace("{page}", page)
        .replace("{limit}", limit),
    })
  ).data;
  return messages;
};

export const send = async (id, data) => {
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
