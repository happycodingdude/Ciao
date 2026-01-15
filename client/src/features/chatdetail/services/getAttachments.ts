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
      timeout: 500,
    })
  ).data;
  const result: AttachmentCache = {
    conversationId: conversationId,
    attachments: data,
  };
  return result;
};

export default getAttachments;
