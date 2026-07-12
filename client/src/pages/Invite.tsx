import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "react-toastify";
import ImageWithLightBoxAndNoLazy from "../components/common/ImageWithLightBoxAndNoLazy";
import { Route } from "../routes/_layout.invite.$code";
import {
  getInvitePreview,
  joinByInvite,
  withdrawJoinRequest,
} from "../services/invite.service";

// Phase 5 — Đợt 2: trang /invite/{code} — người có link xem preview nhóm và tham gia.
// Trạng thái: invalid/expired (không lộ thông tin nhóm) · member (mở chat) ·
// pending (chờ duyệt, có thể rút) · active (bấm Join → vào thẳng hoặc chuyển pending).
// "Vào thẳng" persist async qua Kafka → điều hướng về danh sách hội thoại, card nhóm
// tới qua event realtime NewMembers.
const Invite = () => {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [working, setWorking] = useState(false);
  // Ghi đè trạng thái pending cục bộ sau khi Join/Withdraw (không refetch preview).
  const [pendingOverride, setPendingOverride] = useState<boolean | null>(null);

  const { data: preview, isLoading } = useQuery({
    queryKey: ["invitePreview", code],
    queryFn: () => getInvitePreview(code),
  });

  const isPending = pendingOverride ?? preview?.hasPendingRequest ?? false;

  const join = async () => {
    if (working) return;
    setWorking(true);
    try {
      const result = await joinByInvite(code);
      if (!result) throw new Error("Empty join response");
      if (result.status === "pending") {
        setPendingOverride(true);
        toast.success("Request sent — waiting for admin approval");
      } else {
        // joined / member — card nhóm tới qua realtime; về danh sách hội thoại.
        toast.success(`Welcome to ${result.title ?? "the group"}!`);
        // "joined" persist BẤT ĐỒNG BỘ qua Kafka (reopen member + system message). Một lần invalidate
        // ngay lập tức thường refetch TRÚNG cache CŨ (member self vẫn isDeleted → list lọc ẩn hội thoại)
        // và event realtime NewMembers là FCM-only nên dễ miss khi đang điều hướng. Vì vậy lặp lại
        // invalidate trễ vài nhịp để chắc chắn kéo được trạng thái đã reopen từ server → hội thoại hiện ra.
        for (const delay of [0, 800, 2000, 4000]) {
          if (delay === 0)
            queryClient.invalidateQueries({ queryKey: ["conversation"] });
          else
            setTimeout(
              () =>
                queryClient.invalidateQueries({ queryKey: ["conversation"] }),
              delay,
            );
        }
        if (result.status === "member" && result.conversationId) {
          navigate({
            to: "/conversations/$conversationId",
            params: { conversationId: result.conversationId },
          });
        } else {
          navigate({ to: "/conversations" });
        }
      }
    } catch {
      toast.error("Could not join with this link");
    } finally {
      setWorking(false);
    }
  };

  const withdraw = async () => {
    if (working) return;
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

  return (
    <div className="bg-(--bg-color) flex h-dvh w-full items-center justify-center">
      <div
        className="border-(--border-color) bg-(--bg-color) flex w-[26rem] max-w-[90vw] flex-col items-center gap-4
          rounded-2xl border-[.1rem] p-8 shadow-[0_2px_20px_rgba(0,0,0,0.08)]"
      >
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
              onClick={() => navigate({ to: "/conversations" })}
            >
              Back to chats
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
    </div>
  );
};

export default Invite;
