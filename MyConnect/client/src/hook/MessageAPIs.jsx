import { HttpRequest } from "../common/Utility";

const page = 1;
const limit = 10;

export const getMessages = async (conversation) => {
  const messages = (
    await HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_GET.replace(
        "{id}",
        conversation.id,
      )
        .replace("{page}", page)
        .replace("{limit}", limit),
    })
  ).data;
  return {
    conversation,
    messages,
  };
};

export const send = async (data) => {
  return (
    await HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_SEND,
      data: data,
      timeout: 500,
    })
  ).data;
};
