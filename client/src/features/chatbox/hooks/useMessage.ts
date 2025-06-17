import { useQuery } from "@tanstack/react-query";

// const useMessage = (
//   conversationId?: string,
//   page?: number,
// ): UseQueryResult<MessageCache> => {
//   return useQuery({
//     queryKey: ["message"],
//     queryFn: () => getMessages(conversationId, page),
//     staleTime: Infinity,
//     enabled: false,
//   });
// };

// const useMessage = (
//   conversationId?: string,
//   page?: number,
// ): UseQueryResult<MessageCache> => {
//   return useQuery({
//     queryKey: ["messages", conversationId ?? "none", page],
//     queryFn: () => getMessages(conversationId!, page),
//     enabled: !!conversationId,

//     staleTime: 60 * 1000, // giữ dữ liệu "mới" trong 1 phút
//     gcTime: 5 * 60 * 1000, // 5 phút giữ cache sau khi component unmount
//   });
// };

// const useMessage = () => {
//   const queryClient = useQueryClient();

//   const fetchMessages = (conversationId: string, page: number) =>
//     queryClient.fetchQuery({
//       queryKey: ["messages", conversationId, page],
//       queryFn: () => getMessages(conversationId, page),
//       staleTime: 60_000,
//       gcTime: 300_000,
//     });

//   return { fetchMessages };
// };

// const useMessage = (conversationId?: string, page: number = 1) => {
//   return useQuery({
//     queryKey: ["messages", conversationId ?? "none", page],
//     queryFn: () => getMessages(conversationId!, page),
//     enabled: false, // 👈 không gọi tự động
//     staleTime: 60_000,
//     gcTime: 300_000,
//   });
// };

const useMessage = () => {
  return useQuery({
    queryKey: ["message"],
    queryFn: () => Promise.resolve(null), // không thực sự fetch
    enabled: false, // chỉ đọc cache
    staleTime: 60_000,
    gcTime: 300_000,
  });
};

export default useMessage;
