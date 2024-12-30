import HttpRequest from "../../../lib/fetch";

const reactMessage = async (id, type) => {
  return (
    await HttpRequest({
      method: "put",
      url: desc
        ? import.meta.env.VITE_ENDPOINT_MESSAGE_UNREACT.replace(
            "{conversationId}",
            id,
          ).replace("{id}", id)
        : import.meta.env.VITE_ENDPOINT_MESSAGE_REACT.replace(
            "{conversationId}",
            id,
          )
            .replace("{id}", id)
            .replace("{type}", type),
    })
  ).data;
};

export default reactMessage;
