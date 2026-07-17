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
// Thời gian tối đa chờ event NewMembers sau khi join thành công; quá hạn (miss FCM)
// → fallback dựng card optimistic self-only rồi vào hội thoại luôn.
const JOIN_EVENT_TIMEOUT_MS = 5000;

const InviteJoinModal = () => {
  // Param nằm ngoài schema của route hiện hành → đọc non-strict (mọi trang dưới _layout).
  const { invite: code } = useSearch({ strict: false }) as { invite?: string };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: info } = useInfo();
  const [working, setWorking] = useState(false);
  // Ghi đè trạng thái pending cục bộ sau khi Join/Withdraw (không refetch preview).
  const [pendingOverride, setPendingOverride] = useState<boolean | null>(null);
  // Đã join xong ("joined"), đang GIỮ modal chờ event NewMembers hoàn thiện card trong cache
  // (members/theme/system message đầy đủ) rồi mới đóng modal + mở hội thoại — tránh hiện
  // card "nửa vời" rồi giật cập nhật, và không refetch /conversations.
  const [waitingConv, setWaitingConv] = useState<{
    id: string;
    title?: string;
  } | null>(null);

  // Mount thường trực ở layout → reset state cục bộ khi đổi sang link mời khác.
  useEffect(() => {
    setPendingOverride(null);
    setWaitingConv(null);
    setWorking(false);
  }, [code]);

  const { data: preview, isLoading } = useQuery({
    queryKey: ["invitePreview", code],
    queryFn: () => getInvitePreview(code!),
    enabled: !!code,
  });

  const isPending = pendingOverride ?? preview?.hasPendingRequest ?? false;

  // Đóng modal = gỡ ?invite khỏi URL, GIỮ NGUYÊN trang + các search param còn lại.
  // Đóng khi đang chờ event = hủy auto-mở hội thoại (join ĐÃ thành công — card sẽ
  // tới qua event NewMembers, user tự mở từ danh sách).
  const close = () => {
    if (waitingConv) {
      setWaitingConv(null);
      setWorking(false);
    }
    navigate({
      to: ".",
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        invite: undefined,
      }),
      replace: true,
    });
  };

  // Fallback khi MISS event NewMembers (timeout): chèn card optimistic self-only như cũ
  // để list không trống hội thoại vừa join; event/refetch tự nhiên sau sẽ hoàn thiện.
  const insertOptimisticCard = (convId: string, title?: string) => {
    if (!info?.id) return;
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
          title: title ?? preview?.title,
          avatar: preview?.avatar ?? undefined,
          isGroup: true,
        } as ConversationModel,
        undefined,
        undefined,
        undefined,
        // Self-member active — bắt buộc, list lọc theo self-member !isDeleted.
        // lastSeenTime = now: vừa join coi như đã bắt kịp lịch sử → Chatbox mở ở ĐÁY,
        // không hiện chip "n tin nhắn mới" (khớp BE: HandleNewMember set LastSeenTime = join time).
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
  };

  // Chờ event NewMembers hoàn thiện card rồi mới đóng modal + mở hội thoại.
  // Card "đầy đủ" = có trong cache với self-member active — chỉ onNewMembers tạo/mở lại
  // được trạng thái này (rejoin: entry cũ self isDeleted=true nên không match sớm).
  useEffect(() => {
    if (!waitingConv || !info?.id) return;
    const { id: convId, title } = waitingConv;
    const selfId = info.id;
    let done = false;

    const hasFullCard = () => {
      const cache = queryClient.getQueryData<ConversationCache>(["conversation"]);
      const conv = (cache?.conversations ?? []).find((c) => c.id === convId);
      return !!conv?.members?.some(
        (m) => m.contact?.id === selfId && !m.isDeleted,
      );
    };

    // Guard done: subscribe có thể bắn thêm lần nữa trước khi cleanup chạy.
    const finish = () => {
      if (done) return;
      done = true;
      setWaitingConv(null);
      setWorking(false);
      toast.success(`Welcome to ${title ?? "the group"}!`);
      // Điều hướng sang route không còn ?invite → modal tự đóng.
      navigate({
        to: "/conversations/$conversationId",
        params: { conversationId: convId },
      });
    };

    // Event có thể đã về TRƯỚC khi response join trả (Kafka nhanh) → check ngay.
    if (hasFullCard()) {
      finish();
      return;
    }
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.query?.queryKey?.[0] === "conversation" && hasFullCard())
        finish();
    });
    const timer = setTimeout(() => {
      insertOptimisticCard(convId, title);
      finish();
    }, JOIN_EVENT_TIMEOUT_MS);
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
    // insertOptimisticCard cố tình không nằm trong deps: chỉ đọc info/preview qua closure,
    // effect chỉ cần chạy lại khi waitingConv/self đổi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitingConv, info?.id, queryClient, navigate]);

  const join = async () => {
    if (working || !code) return;
    setWorking(true);
    try {
      const result = await joinByInvite(code);
      if (!result) throw new Error("Empty join response");
      if (result.status === "pending") {
        setPendingOverride(true);
        toast.success("Request sent — waiting for admin approval");
        setWorking(false);
        return;
      }
      if (result.status === "member" && result.conversationId) {
        // Đã là member từ trước → mở thẳng hội thoại, không cần chờ gì.
        setWorking(false);
        navigate({
          to: "/conversations/$conversationId",
          params: { conversationId: result.conversationId },
        });
        return;
      }
      if (result.conversationId) {
        // "joined" persist BẤT ĐỒNG BỘ qua Kafka → GIỮ modal ở trạng thái Joining…,
        // chờ event NewMembers (snapshot đầy đủ members/theme/system message) hoàn thiện
        // card trong cache rồi mới đóng + mở hội thoại (effect phía trên). KHÔNG refetch
        // /conversations, KHÔNG hiện card nửa vời. working giữ true trong lúc chờ.
        // Cache tin nhắn của hội thoại vừa rejoin có thể đang giữ trang RỖNG/cũ (từ trước
        // khi rời nhóm hoặc lúc BE cache còn lạnh) → invalidate để lần mở tới refetch fresh.
        queryClient.invalidateQueries({
          queryKey: ["message", result.conversationId],
        });
        setWaitingConv({
          id: result.conversationId,
          title: result.title ?? preview?.title,
        });
        return;
      }
      // joined nhưng thiếu conversationId — không thể chờ/điều hướng cụ thể → fallback
      // một lần invalidate; card sẽ tới qua event NewMembers hoặc lần refetch này.
      toast.success(`Welcome to ${result.title ?? "the group"}!`);
      queryClient.invalidateQueries({ queryKey: ["conversation"] });
      setWorking(false);
      navigate({ to: "/conversations", search: {} });
    } catch {
      toast.error("Could not join with this link");
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
                  {working
                    ? "Joining…"
                    : preview.requireApproval
                      ? "Request to join"
                      : "Join group"}
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
