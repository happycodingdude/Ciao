import { HttpRequest } from "../lib/fetch";

export const getAttachments = async (conversationId) => {
  return (
    await HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_ATTACHMENT_GET.replace(
        "{id}",
        conversationId,
      ),
    })
  ).data;
};
