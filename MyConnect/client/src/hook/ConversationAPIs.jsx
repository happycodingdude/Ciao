import { HttpRequest } from "../common/Utility";

const page = 1;
const limit = 10;

export const getConversation = async () => {
  return (
    await HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_GETWITHPAGING.replace(
        "{page}",
        page,
      ).replace("{limit}", limit),
    })
  ).data;
};
