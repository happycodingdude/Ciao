import HttpRequest from "../../../lib/fetch";

const getConversations = async (page) => {
  const data = (
    await HttpRequest({
      method: "get",
      url:
        page === 1
          ? import.meta.env.VITE_ENDPOINT_CONVERSATION_GET
          : import.meta.env.VITE_ENDPOINT_CONVERSATION_GETWITHPAGING.replace(
              "{page}",
              page,
            ),
      // axiosInstance: axios,
    })
  ).data;
  return {
    conversations: data,
    filterConversations: data,
  };
};
export default getConversations;
