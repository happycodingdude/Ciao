import { useQuery, useQueryClient } from "@tanstack/react-query";

export type ReplyState = {
  replyId?: string;
  replyContact?: string;
  replyContactName?: string;
  replyContent?: string;
} | null;

const REPLY_KEY = ["reply"] as const;

export const useReply = () => {
  const queryClient = useQueryClient();

  const { data: reply } = useQuery<ReplyState>({
    queryKey: REPLY_KEY,
    queryFn: () => null,
    staleTime: Infinity,
  });

  const setReply = (state: ReplyState) => {
    queryClient.setQueryData(REPLY_KEY, state);
  };

  const clearReply = () => {
    queryClient.setQueryData(REPLY_KEY, null);
  };

  return { reply: reply ?? null, setReply, clearReply };
};
