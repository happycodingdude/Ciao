import {
  useInfiniteQuery,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import { getNotifications } from "../services/notification.service";
import { NotificationModel } from "../types/base.types";

const PAGE_SIZE = 10;

// Hook đơn giản dùng cho dropdown notification ở sidebar — chỉ trang đầu.
// queryKey ["notification"] giữ nguyên để không phá callsite hiện hữu.
const useNotification = (): UseQueryResult<NotificationModel[]> => {
  return useQuery({
    queryKey: ["notification"],
    // Bọc trong arrow để React Query không truyền QueryFunctionContext vào tham số page.
    queryFn: () => getNotifications(1, PAGE_SIZE),
    staleTime: Infinity,
  });
};

// Hook phân trang cho trang Informations (/notifications). queryKey riêng để tách biệt
// list đơn của sidebar; cả hai cross-invalidate khi read/readAll.
export const useInfiniteNotifications = () => {
  return useInfiniteQuery({
    queryKey: ["notifications", "infinite"],
    queryFn: ({ pageParam }) => getNotifications(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    // Còn trang tiếp nếu trang vừa rồi trả về đủ PAGE_SIZE item.
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
    // staleTime:0 → refetchOnMount (default) tự làm mới mỗi lần vào trang, đúng 1 lần.
    // Tránh phải invalidate thủ công (gây fetch trùng). read/readAll vẫn cross-invalidate.
    staleTime: 0,
  });
};

export default useNotification;
