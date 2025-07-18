import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { AttachmentCache } from "../../listchat/types";

const useAttachment = (): UseQueryResult<AttachmentCache> => {
  return useQuery({
    queryKey: ["attachment"],
    queryFn: () => Promise.resolve(null), // không thực sự fetch
    enabled: false, // chỉ đọc cache
    staleTime: 60_000,
    gcTime: 300_000,
  });
};

export default useAttachment;
