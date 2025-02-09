import HttpRequest from "../../../lib/fetch";
import { UpdateConversationRequest } from "../types";

const updateConversation = async (model: UpdateConversationRequest) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_GETBYID.replace(
        "{id}",
        model.id,
      ),
      data: {
        title: model.title,
        avatar: model.avatar,
      },
    })
  ).data;
};

export default updateConversation;
