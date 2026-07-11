import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { updateConversationAppearance } from "../services/conv.service";
import { ConversationCache } from "../types/conv.types";
import { PendingMessageModel } from "../types/message.types";
import { updateConversationInCache } from "../utils/conversationCache";
import { upsertRealtimeMessage } from "../utils/messageCache";
import useConversation from "./useConversation";

// Phase 3 — Đợt 3 (rev 2): hình nền + màu bong bóng CHUNG cho cả hội thoại
// (conversation-level, mọi thành viên đều thấy; member khác nhận qua event
// ConversationAppearanceChanged). BE set CẢ HAI field mỗi lần gọi → luôn gửi kèm
// giá trị hiện tại của field không đổi (chỉ gửi field đang đổi sẽ xóa nhầm field kia).
const useConversationAppearance = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { data: conversations } = useConversation();
  const [saving, setSaving] = useState(false);

  const conversation = conversations?.conversations?.find(
    (c) => c.id === conversationId,
  );

  const wallpaper = conversation?.wallpaper ?? null;
  const bubbleColor = conversation?.bubbleColor ?? null;

  const patchCache = (wp: string | null, bc: string | null) => {
    queryClient.setQueryData<ConversationCache>(["conversation"], (old) =>
      old
        ? updateConversationInCache(old, conversationId, (c) => ({
            ...c,
            wallpaper: wp,
            bubbleColor: bc,
          }))
        : old,
    );
  };

  const setAppearance = async (next: {
    wallpaper?: string | null;
    bubbleColor?: string | null;
  }) => {
    if (!conversationId || saving) return;
    const nextWallpaper = next.wallpaper !== undefined ? next.wallpaper : wallpaper;
    const nextBubbleColor =
      next.bubbleColor !== undefined ? next.bubbleColor : bubbleColor;
    if (nextWallpaper === wallpaper && nextBubbleColor === bubbleColor) return;

    setSaving(true);
    // Optimistic: user thấy nền/bong bóng đổi ngay; lỗi → rollback giá trị cũ.
    patchCache(nextWallpaper, nextBubbleColor);
    try {
      const result = await updateConversationAppearance(
        conversationId,
        nextWallpaper,
        nextBubbleColor,
      );
      // BE trả về dòng hệ thống "{user} changed the chat theme" đã persist (id thật) →
      // append vào khung chat của chính người đổi. upsert dedupe theo id nên không
      // sợ trùng nếu event realtime nào đó cũng mang tin này về.
      if (result?.systemMessage) {
        upsertRealtimeMessage(
          queryClient,
          conversationId,
          result.systemMessage as PendingMessageModel,
        );
      }
    } catch (err) {
      console.error("Failed to update conversation appearance: ", err);
      patchCache(wallpaper, bubbleColor);
      toast.error("Không thể lưu tùy chỉnh đoạn chat");
    } finally {
      setSaving(false);
    }
  };

  return { wallpaper, bubbleColor, setAppearance, saving };
};

export default useConversationAppearance;
