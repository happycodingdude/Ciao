import { useQuery } from "@tanstack/react-query";
import getAttachments from "../services/getAttachments";

const useAttachment = (conversationId) => {
  return useQuery({
    queryKey: ["attachment"],
    queryFn: () => getAttachments(conversationId),
    staleTime: Infinity,
    enabled: false,
    // refetchOnWindowFocus: false,
  });
};
export default useAttachment;
