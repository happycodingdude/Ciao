import HttpRequest from "../../../lib/fetch";
import { PinMessageRequest } from "../types";

const pinMessage = async (model: PinMessageRequest) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_MESSAGE_PIN.replace(
        "{conversationId}",
        model.conversationId,
      )
        .replace("{id}", model.messageId)
        .replace("{pinned}", model.pinned),
    })
  ).data;
};

export default pinMessage;
