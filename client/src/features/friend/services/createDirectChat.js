import HttpRequest from "../../../lib/fetch";

const createDirectChat = async (contactId) => {
  return (
    await HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_CREATE_DIRECT.replace(
        "{contact-id}",
        contactId,
      ),
    })
  ).data;
};
export default createDirectChat;
