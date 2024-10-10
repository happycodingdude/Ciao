import { HttpRequest } from "../common/Utility";

export const getConversation = async (page) => {
  return (
    await HttpRequest({
      method: "get",
      url:
        page === 1
          ? import.meta.env.VITE_ENDPOINT_CONVERSATION_GET
          : import.meta.env.VITE_ENDPOINT_CONVERSATION_GETWITHPAGING.replace(
              "{page}",
              page,
            ),
    })
  ).data;
};
