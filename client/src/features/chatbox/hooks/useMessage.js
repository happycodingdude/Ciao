import { useQuery } from "@tanstack/react-query";
import getMessages from "../services/getMessages";

const useMessage = (conversationId, setHasMore) => {
  return useQuery({
    queryKey: ["message", conversationId],
    queryFn: async () => {
      const data = await getMessages(conversationId, 1);
      setHasMore(data.hasMore);
      return { messages: data.messages };
    },
  });
};

export default useMessage;
