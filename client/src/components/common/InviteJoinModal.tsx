import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useInfo from "../../hooks/useInfo";
import {
  getInvitePreview,
  joinByInvite,
  withdrawJoinRequest,
} from "../../services/invite.service";
import { ConversationCache, ConversationModel } from "../../types/conv.types";
import { createNewConversation } from "../../utils/notificationCacheHelpers";
import BackgroundPortal from "./BackgroundPortal";
import ImageWithLightBoxAndNoLazy from "./ImageWithLightBoxAndNoLazy";

// Phase 5 — Đợt 2: tham gia nhóm qua link mời. Route /invite/{code} REDIRECT về trang
// hiện hành kèm ?invite={code} → modal này (mount ở _layout, portal như mọi modal khác)
// hiện đè lên trang user đang thao tác thay vì thay cả trang bằng nền trắng.
// Trạng thái: invalid/expired (không lộ thông tin nhóm) · member (mở chat) ·
// pending (chờ duyệt, có thể rút) · active (bấm Join → vào thẳng hoặc chuyển pending).
const InviteJoinModal = () => {
  // Param nằm ngoài schema của route hiện hành → đọc non-strict (mọi trang dưới _layout).
  const { invite: code } = useSearch({ strict: false }) as { invite?: string };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const [working, setWorking] = useState(false);
  // Ghi đè trạng thái pending cục bộ sau khi Join/Withdraw (không refetch preview).
  const [pendingOverride, setPendingOverride] = useState<boolean | null>(null);

  // Mount thường trực ở layout → reset state cục bộ khi đổi sang link mời khác.
  useEffect(() => {
    setPendingOverride(null);
  }, [code]);

  const { data: preview, isLoading } = useQuery({
    queryKey: ["invitePreview", code],
    queryFn: () => getInvitePreview(code!),
    enabled: !!code,
  });

  const isPending = pendingOverride ?? preview?.hasPendingRequest ?? false;

  // Đóng modal = gỡ ?invite khỏi URL, GIỮ NGUYÊN trang + các search param còn lại.
  const close = () =>
    navigate({
      to: ".",
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        invite: undefined,
      }),
      replace: true,
    });

  const join = async () => {
    if (working || !code) return;
    setWorking(true);
    try {
      const result = await joinByInvite(code);
      if (!result) throw new Error("Empty join response");
      if (result.status === "pending") {
        setPendingOverride(true);
        toast.success("Request sent — waiting for admin approval");
      } else {
        // joined / member — về danh sách hội thoại.
        toast.success(`Welcome to ${result.title ?? "the group"}!`);
        // "joined" persist BẤT ĐỒNG BỘ qua Kafka. Chèn OPTIMISTIC card nhóm vào cache từ
        // dữ liệu ĐÃ CÓ (preview + response) — hiện ngay không cần chờ server (conversation
        // query staleTime 1h nên mount không refetch đè); rồi reconcile đúng MỘT lần sau khi
        // consumer kịp persist. Event FCM NewMembers vẫn là lưới realtime thứ hai.
        if (result.conversationId && info?.id) {
          const convId = result.conversationId;
          queryClient.setQueryData<ConversationCache>(["conversation"], (old) => {
            if (!old) return old;
            // Loại entry cũ (nếu từng ở nhóm rồi rời — self-member isDeleted) trước khi chèn
            // bản mới, tránh 2 entry cùng id trong cache.
            const withoutOld = {
              ...old,
              conversations: (old.conversations ?? []).filter((c) => c.id !== convId),
              filterConversations: (old.filterConversations ?? []).filter((c) => c.id !== convId),
            };
            return createNewConversation(
              withoutOld,
              {
                id: convId,
                title: result.title ?? preview?.title,
                avatar: preview?.avatar ?? undefined,
                isGroup: true,
              } as ConversationModel,
              undefined,
              undefined,
              undefined,
              // Self-member active — bắt buộc, list lọc theo self-member !isDeleted.
              // lastSeenTime = now: vừa join coi như đã bắt kịp lịch sử → Chatbox mở ở ĐÁY,
              // không hiện chip "n tin nhắn mới" (khớp BE: HandleNewMember set LastSeenTime
              // = join time; đây là bản optimistic trước khi reconcile 2.5s).
              [
                {
                  contact: { id: info.id, name: info.name, avatar: info.avatar },
                  isDeleted: false,
                  isNotifying: true,
                  isModerator: false,
                  lastSeenTime: new Date().toISOString(),
                },
              ],
            );
          });
          setTimeout(
            () => queryClient.invalidateQueries({ queryKey: ["conversation"] }),
            2500,
          );
          // Cache tin nhắn của hội thoại vừa rejoin có thể đang giữ trang RỖNG/cũ (từ trước
          // khi rời nhóm hoặc lúc BE cache còn lạnh) và staleTime 120s sẽ khiến lần mở đầu
          // đọc thẳng cache đó → khung chat trống. Invalidate để lần mở tới refetch fresh.
          queryClient.invalidateQueries({ queryKey: ["message", convId] });
        } else {
          // Không đủ dữ liệu dựng optimistic card (thiếu conversationId/info) → fallback
          // một lần invalidate; card sẽ tới qua event NewMembers hoặc lần refetch này.
          queryClient.invalidateQueries({ queryKey: ["conversation"] });
        }
        // Điều hướng sang route không còn ?invite → modal tự đóng.
        if (result.status === "member" && result.conversationId) {
          navigate({
            to: "/conversations/$conversationId",
            params: { conversationId: result.conversationId },
          });
        } else {
          navigate({ to: "/conversations", search: {} });
        }
      }
    } catch {
      toast.error("Could not join with this link");
    } finally {
      setWorking(false);
    }
  };

  const withdraw = async () => {
    if (working || !code) return;
    setWorking(true);
    try {
      await withdrawJoinRequest(code);
      setPendingOverride(false);
      toast.success("Request withdrawn");
    } catch {
      toast.error("Failed to withdraw the request");
    } finally {
      setWorking(false);
    }
  };

  if (!code) return null;

  return (
    <BackgroundPortal
      show
      noHeader
      className="w-[26rem] max-w-[90vw]"
      onClose={close}
    >
      <div className="flex flex-col items-center gap-4 p-8">
        {isLoading ? (
          <p className="text-sm opacity-60">Loading invite…</p>
        ) : !preview || preview.status !== "active" ? (
          <>
            <i className="fa fa-link-slash base-icon text-3xl opacity-40"></i>
            <p className="text-center font-medium">
              {preview?.status === "expired"
                ? "This invite link has expired"
                : "This invite link is invalid or has been revoked"}
            </p>
            <p className="text-center text-sm opacity-60">
              Ask a group admin to share a new link.
            </p>
            <button
              className="bg-(--bg-color-extrathin) hover:text-light-blue-500 cursor-pointer rounded-lg px-6 py-2 text-sm font-medium"
              onClick={close}
            >
              Close
            </button>
          </>
        ) : (
          <>
            <ImageWithLightBoxAndNoLazy
              src={preview.avatar ?? undefined}
              className="aspect-square w-20"
              circle
              slides={[{ src: preview.avatar ?? "" }]}
              onClick={() => {}}
            />
            <div className="flex flex-col items-center gap-1">
              <p className="text-center text-base font-medium">
                {preview.title}
              </p>
              <p className="text-sm opacity-60">
                Group · {preview.memberCount} members
              </p>
            </div>

            {preview.isMember && preview.conversationId ? (
              <>
                <p className="text-sm opacity-60">
                  You are already a member of this group.
                </p>
                <button
                  className="bg-linear-to-br from-light-blue-300 to-light-blue-500 cursor-pointer rounded-lg px-6 py-2
                    text-sm font-medium text-white"
                  onClick={() =>
                    navigate({
                      to: "/conversations/$conversationId",
                      params: { conversationId: preview.conversationId! },
                    })
                  }
                >
                  Open chat
                </button>
              </>
            ) : isPending ? (
              <>
                <p className="text-center text-sm opacity-60">
                  Your request to join is pending admin approval.
                </p>
                <button
                  className="bg-(--bg-color-extrathin) cursor-pointer rounded-lg px-6 py-2 text-sm font-medium
                    text-red-500 disabled:opacity-50"
                  disabled={working}
                  onClick={withdraw}
                >
                  Withdraw request
                </button>
              </>
            ) : (
              <>
                {preview.requireApproval && (
                  <p className="text-center text-sm opacity-60">
                    An admin needs to approve your request to join.
                  </p>
                )}
                <button
                  className="bg-linear-to-br from-light-blue-300 to-light-blue-500 cursor-pointer rounded-lg px-6 py-2
                    text-sm font-medium text-white disabled:opacity-50"
                  disabled={working}
                  onClick={join}
                >
                  {preview.requireApproval ? "Request to join" : "Join group"}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </BackgroundPortal>
  );
};

export default InviteJoinModal;
