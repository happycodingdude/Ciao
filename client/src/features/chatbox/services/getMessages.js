import HttpRequest from "../../../lib/fetch";

const getMessages = async (conversationId, page) => {
  return (
    await HttpRequest({
      method: "get",
      url:
        page === 1
          ? import.meta.env.VITE_ENDPOINT_MESSAGE_GET.replace(
              "{id}",
              conversationId,
            )
          : import.meta.env.VITE_ENDPOINT_MESSAGE_GETWITHPAGING.replace(
              "{id}",
              conversationId,
            ).replace("{page}", page),
      // axiosInstance: axios,
    })
  ).data;
};
export default getMessages;
