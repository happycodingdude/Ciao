import HttpRequest from "../../../lib/fetch";

const reactMessage = async (conversationId, messageId, type, desc) => {
  return (
    await HttpRequest({
      method: "put",
      url: desc
        ? import.meta.env.VITE_ENDPOINT_MESSAGE_UNREACT.replace(
            "{conversationId}",
            conversationId,
          ).replace("{id}", messageId)
        : import.meta.env.VITE_ENDPOINT_MESSAGE_REACT.replace(
            "{conversationId}",
            conversationId,
          )
            .replace("{id}", messageId)
            .replace("{type}", type),
    })
  ).data;
};

export default reactMessage;
