import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { willResetPanelOnConversation } from "../../context/ChatDetailTogglesContext";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import {
  getJoinRequests,
  reviewJoinRequest,
} from "../../services/invite.service";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import CustomLabel from "../common/CustomLabel";

type Props = {
  conversationId: string;
};

// Phase 5 — Đợt 2: hàng chờ "Join requests" trong panel Information (nhóm, CHỈ quản trị).
// Realtime: event JoinRequestUpdated invalidate ["joinRequests", id] → list tự refetch.
// Không có yêu cầu nào → ẩn hẳn section (giữ panel gọn; quản trị được báo qua notification).
const InformationJoinRequests = ({ conversationId }: Props) => {
  const queryClient = useQueryClient();
  // contactId đang xử lý — khoá đúp nút khi chờ API.
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Panel Information luôn mounted (toggle bằng z-index) → chỉ fetch khi panel mở
  // (cùng guard các section khác). Event JoinRequestUpdated invalidate khi panel mở.
  const { showInformation } = useChatDetailToggles();
  const { data: requests = [] } = useQuery({
    queryKey: ["joinRequests", conversationId],
    queryFn: () => getJoinRequests(conversationId),
    enabled: showInformation && !willResetPanelOnConversation(conversationId),
  });

  if (requests.length === 0) return null;

  const review = async (contactId: string, approved: boolean) => {
    if (processingId) return;
    setProcessingId(contactId);
    try {
      await reviewJoinRequest(conversationId, contactId, approved);
      // Gỡ ngay khỏi list local — event realtime sẽ đồng bộ các quản trị khác.
      queryClient.setQueryData(
        ["joinRequests", conversationId],
        requests.filter((r) => r.contactId !== contactId),
      );
      toast.success(approved ? "Request approved" : "Request declined");
    } catch {
      toast.error("Failed to process the request");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-8 items-center">
        <p className="font-medium">Join requests ({requests.length})</p>
      </div>
      <div className="flex flex-col">
        {requests.map((item) => (
          <div
            key={item.contactId}
            className="hover:bg-(--bg-color-extrathin) flex w-full items-center gap-4 rounded-lg p-2"
          >
            <ImageWithLightBoxAndNoLazy
              src={item.avatar}
              className="aspect-square h-8"
              circle
              slides={[{ src: item.avatar ?? "" }]}
              onClick={() => {}}
            />
            <div className="flex grow flex-col overflow-hidden">
              <CustomLabel title={item.name} />
              <p className="text-2xs opacity-60">
                {new Date(item.requestedTime).toLocaleString()}
              </p>
            </div>
            <div
              className={`flex gap-2 ${processingId === item.contactId ? "pointer-events-none opacity-50" : ""}`}
            >
              <i
                className="fa fa-check base-icon-sm cursor-pointer text-green-500"
                title="Approve"
                onClick={() => review(item.contactId, true)}
              ></i>
              <i
                className="fa fa-xmark base-icon-sm cursor-pointer text-red-500"
                title="Decline"
                onClick={() => review(item.contactId, false)}
              ></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InformationJoinRequests;
