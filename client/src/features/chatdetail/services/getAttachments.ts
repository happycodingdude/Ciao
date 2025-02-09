import HttpRequest from "../../../lib/fetch";
import { AttachmentCache } from "../../listchat/types";

const getAttachments = async (conversationId: string) => {
  return (
    await HttpRequest<undefined, AttachmentCache>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_ATTACHMENT_GET.replace(
        "{id}",
        conversationId,
      ),
    })
  ).data;
};

export default getAttachments;
