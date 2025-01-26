import { useQuery } from "@tanstack/react-query";
import getMessages from "../services/getMessages";

const useMessage_RW = (conversationId, setHasMore) => {
  return useQuery({
    queryKey: ["message", conversationId],
    queryFn: async () => {
      const data = await getMessages(conversationId, 1);
      setHasMore(data.hasMore);
      return { messages: data.messages };
    },
    enabled: false,
  });
};

export default useMessage_RW;
