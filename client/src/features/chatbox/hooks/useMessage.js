import { useQuery } from "@tanstack/react-query";
import getMessages from "../services/getMessages";

const useMessage = (conversationId, page) => {
  // const axios = useAxiosRetry();
  return useQuery({
    queryKey: ["message"],
    queryFn: () => getMessages(conversationId, page),
    staleTime: Infinity,
    enabled: false,
    // refetchOnWindowFocus: false,
  });
};

export default useMessage;
