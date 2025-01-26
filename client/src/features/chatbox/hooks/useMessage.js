import { useQuery } from "@tanstack/react-query";
import getMessages from "../services/getMessages";

const useMessage = (conversationId, page) => {
  return useQuery({
    queryKey: ["message"],
    queryFn: () => getMessages(conversationId, page),
    staleTime: Infinity,
    enabled: false,
  });
};

export default useMessage;
