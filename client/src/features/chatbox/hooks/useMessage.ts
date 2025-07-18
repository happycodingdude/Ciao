import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { MessageCache } from "../../listchat/types";

const useMessage = (): UseQueryResult<MessageCache> => {
  return useQuery({
    queryKey: ["message"],
    queryFn: () => Promise.resolve(null),
    enabled: false, // chỉ đọc cache
  });
};

export default useMessage;
