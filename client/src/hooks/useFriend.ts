import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getFriends } from "../services/friend.service";
import { FriendCache } from "../types/friend.types";

type UseFriendOptions = {
  // Bật polling presence: chỉ Dashboard truyền vào để đồng bộ online/offline real-time.
  // Các caller khác (modal forward/add member/create group) không truyền → giữ nguyên staleTime:Infinity.
  refetchInterval?: number;
};

const useFriend = (
  options: UseFriendOptions = {},
): UseQueryResult<FriendCache[]> => {
  const { refetchInterval } = options;

  return useQuery({
    queryKey: ["friend"],
    queryFn: () => getFriends(),
    staleTime: Infinity,
    refetchInterval,
    // Poll cả khi tab mất focus: presence ping cũng chạy nền, nên dashboard phải tiếp tục
    // đồng bộ để khi quay lại tab đã thấy trạng thái mới (không bị đứng "vẫn như cũ").
    refetchIntervalInBackground: true,
  });
};
export default useFriend;
