import { queryOptions } from "@tanstack/react-query";
import getAttachments from "../../chatdetail/services/getAttachments";
import { AttachmentCache } from "../../listchat/types";

const attachmentQueryOption = (conversationId: string) =>
  queryOptions<AttachmentCache>({
    queryKey: ["attachment", conversationId],
    queryFn: () => getAttachments(conversationId),
    staleTime: 5 * 60 * 1000,
  });

export default attachmentQueryOption;
