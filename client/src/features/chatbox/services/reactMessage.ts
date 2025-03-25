import HttpRequest from "../../../lib/fetch";
import { ReactMessageRequest } from "../types";

const reactMessage = async (model: ReactMessageRequest) => {
  return (
    await HttpRequest({
      method: "put",
      url: model.isUnReact
        ? import.meta.env.VITE_ENDPOINT_MESSAGE_UNREACT.replace(
            "{conversationId}",
            model.conversationId,
          ).replace("{id}", model.messageId)
        : import.meta.env.VITE_ENDPOINT_MESSAGE_REACT.replace(
            "{conversationId}",
            model.conversationId,
          )
            .replace("{id}", model.messageId)
            .replace("{type}", model.type),
    })
  ).data;
};

export default reactMessage;
