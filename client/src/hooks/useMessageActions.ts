import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  editMessage as editMessageApi,
  recallMessage as recallMessageApi,
} from "../services/message.service";
import {
  updateMessageEdited,
  updateMessageRecalled,
} from "../utils/notificationCacheHelpers";
import {
  mutateMessagePages,
  readMessageData,
  writeMessageData,
} from "../utils/messageCache";

// Trạng thái edit chia sẻ giữa ChatInput và message menu (pattern giống useReply).
export type EditState = { messageId: string; content: string } | null;
const EDIT_KEY = ["editMessage"] as const;

export const useMessageEdit = () => {
  const queryClient = useQueryClient();

  const { data: edit } = useQuery<EditState>({
    queryKey: EDIT_KEY,
    queryFn: () => null,
    staleTime: Infinity,
  });

  const setEdit = (state: EditState) => queryClient.setQueryData(EDIT_KEY, state);
  const clearEdit = () => queryClient.setQueryData(EDIT_KEY, null);

  return { edit: edit ?? null, setEdit, clearEdit };
};

export const useMessageActions = (conversationId: string | undefined) => {
  const queryClient = useQueryClient();
  const { clearEdit } = useMessageEdit();
  const [processing, setProcessing] = useState(false);

  // Edit: OPTIMISTIC — cập nhật ngay, rollback nếu API fail (rủi ro thấp vì chỉ đổi text).
  const submitEdit = async (messageId: string, content: string) => {
    const trimmed = content.trim();
    if (!conversationId || !messageId || !trimmed) return;

    const editedTime = new Date().toISOString();
    const prev = readMessageData(queryClient, conversationId);

    mutateMessagePages(queryClient, conversationId, (page) =>
      updateMessageEdited(page, messageId, trimmed, editedTime),
    );
    clearEdit();

    try {
      await editMessageApi(conversationId, messageId, trimmed);
    } catch (err) {
      if (prev) writeMessageData(queryClient, conversationId, prev);
      toast.error("Không thể sửa tin nhắn");
      console.error(err);
    }
  };

  // Recall: chờ server confirm trước khi cập nhật UI (tránh lệch trạng thái khi request fail).
  const recall = async (messageId: string, recalledByContactId: string) => {
    if (!conversationId || !messageId) return;

    setProcessing(true);
    try {
      await recallMessageApi(conversationId, messageId);
      mutateMessagePages(queryClient, conversationId, (page) =>
        updateMessageRecalled(
          page,
          messageId,
          new Date().toISOString(),
          recalledByContactId,
        ),
      );
    } catch (err) {
      toast.error("Không thể thu hồi tin nhắn");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return { submitEdit, recall, processing };
};
