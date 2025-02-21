import HttpRequest from "../../../lib/fetch";
import {
  AttachmentCache,
  AttachmentCache_Attachment,
} from "../../listchat/types";

const getAttachments = async (conversationId: string) => {
  const data = (
    await HttpRequest<undefined, AttachmentCache_Attachment[]>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_ATTACHMENT_GET.replace(
        "{id}",
        conversationId,
      ),
    })
  ).data;
  // const convertedMessages = data.messages.map((message) => {
  //   return { ...message, content: message.content.replace(/\n/g, " <br> ") };
  // });
  const result: AttachmentCache = {
    conversationId: conversationId,
    attachments: data,
  };
  return result;
};

export default getAttachments;
