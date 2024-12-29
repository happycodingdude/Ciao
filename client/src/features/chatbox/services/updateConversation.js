import { HttpRequest } from "../../../lib/fetch";

const updateConversation = async (id, title, avatar) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_GETBYID.replace(
        "{id}",
        id,
      ),
      data: {
        title: title,
        avatar: avatar,
      },
    })
  ).data;
};

export default updateConversation;
