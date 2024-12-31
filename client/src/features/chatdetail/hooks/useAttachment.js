import { useQuery } from "@tanstack/react-query";
import useAxiosRetry from "../../../hooks/useAxiosRetry";
import getAttachments from "../services/getAttachments";

const useAttachment = (conversationId) => {
  const axios = useAxiosRetry();
  return useQuery({
    queryKey: ["attachment"],
    queryFn: () => getAttachments(axios, conversationId),
    staleTime: Infinity,
    enabled: false,
    // refetchOnWindowFocus: false,
  });
};
export default useAttachment;
