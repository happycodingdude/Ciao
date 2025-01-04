import HttpRequest from "../../../lib/fetch";

const sendQuickChat = async (contactId, content) => {
  return HttpRequest({
    method: "post",
    url: import.meta.env.VITE_ENDPOINT_CONVERSATION_CREATE_DIRECT_WITH_MESSAGE.replace(
      "{contact-id}",
      contactId,
    ).replace("{message}", content),
  });
};
export default sendQuickChat;
