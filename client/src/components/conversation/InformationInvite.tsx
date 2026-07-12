import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";
import { willResetPanelOnConversation } from "../../context/ChatDetailTogglesContext";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import useLocalStorage from "../../hooks/useLocalStorage";
import {
  createGroupInvite,
  getGroupInvite,
  revokeGroupInvite,
} from "../../services/invite.service";

type Props = {
  conversationId: string;
};

// Thời hạn link: null = vĩnh viễn; số = giờ (BE nhận expiresInHours, trần 720h).
const EXPIRY_OPTIONS: { label: string; hours: number | null }[] = [
  { label: "Never expires", hours: null },
  { label: "1 day", hours: 24 },
  { label: "7 days", hours: 168 },
  { label: "30 days", hours: 720 },
];

// Phase 5 — Đợt 2: section "Invite link" trong panel Information (nhóm, CHỈ quản trị —
// BE cũng enforce, đây chỉ là lớp UI). Tạo link kèm QR; tùy chọn cần duyệt + thời hạn;
// "New link" thay code cũ (link cũ vô hiệu ngay); "Revoke" thu hồi hẳn.
const InformationInvite = ({ conversationId }: Props) => {
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useLocalStorage("showInviteLink", true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Panel Information luôn mounted (toggle bằng z-index) → chỉ fetch khi panel
  // đang mở và không sắp bị reset do đổi conversation (cùng guard các section khác).
  const { showInformation } = useChatDetailToggles();
  const { data, isLoading } = useQuery({
    queryKey: ["groupInvite", conversationId],
    queryFn: () => getGroupInvite(conversationId),
    enabled: showInformation && !willResetPanelOnConversation(conversationId),
  });
  const invite = data?.invite ?? null;

  const link = invite
    ? `${window.location.origin}/invite/${invite.code}`
    : null;

  const create = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const result = await createGroupInvite(
        conversationId,
        requireApproval,
        expiresInHours,
      );
      queryClient.setQueryData(["groupInvite", conversationId], result);
      toast.success(invite ? "New invite link created" : "Invite link created");
    } catch {
      toast.error("Failed to create invite link");
    } finally {
      setSaving(false);
    }
  };

  const revoke = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await revokeGroupInvite(conversationId);
      queryClient.setQueryData(["groupInvite", conversationId], {
        invite: null,
      });
      toast.success("Invite link revoked");
    } catch {
      toast.error("Failed to revoke invite link");
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Invite link copied");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-8 items-center justify-between">
        <p className="font-medium">Invite link</p>
        <i
          data-show={showInvite}
          className="fa-arrow-down fa-solid base-icon-sm flex aspect-square cursor-pointer items-center justify-center
          transition-all duration-500 data-[show=false]:rotate-90"
          onClick={() => setShowInvite((v) => !v)}
        ></i>
      </div>
      <div
        data-show={showInvite}
        className="flex flex-col gap-3 overflow-hidden transition-all duration-500 data-[show=false]:max-h-0
          data-[show=false]:opacity-0 data-[show=true]:opacity-100"
      >
        {isLoading ? (
          <p className="text-sm opacity-60">Loading…</p>
        ) : invite && link ? (
          <>
            {/* QR nền trắng cố định để máy quét đọc được ở cả dark mode */}
            <div className="flex justify-center">
              <div className="rounded-lg bg-white p-3">
                <QRCode value={link} size={132} />
              </div>
            </div>
            <div
              className="bg-(--bg-color-extrathin) flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2"
              title="Copy invite link"
              onClick={copy}
            >
              <p className="grow truncate text-sm">{link}</p>
              <i className="fa fa-copy base-icon-sm hover:text-light-blue-500"></i>
            </div>
            <p className="text-xs opacity-60">
              {invite.requireApproval
                ? "New members must be approved by an admin."
                : "Anyone with the link joins instantly."}{" "}
              {invite.expired ? (
                <span className="text-red-500">Link has expired.</span>
              ) : invite.expireTime ? (
                `Expires ${new Date(invite.expireTime).toLocaleString()}.`
              ) : (
                "Never expires."
              )}
            </p>
            <div className="flex gap-2">
              <button
                className="bg-(--bg-color-extrathin) hover:text-light-blue-500 grow cursor-pointer rounded-lg py-2 text-sm
                  font-medium disabled:opacity-50"
                disabled={saving}
                onClick={create}
              >
                New link
              </button>
              <button
                className="bg-(--bg-color-extrathin) grow cursor-pointer rounded-lg py-2 text-sm font-medium text-red-500
                  disabled:opacity-50"
                disabled={saving}
                onClick={revoke}
              >
                Revoke
              </button>
            </div>
          </>
        ) : (
          <>
            <label className="flex cursor-pointer items-center justify-between text-sm">
              <span>Require admin approval</span>
              <input
                type="checkbox"
                className="accent-light-blue-500 h-4 w-4 cursor-pointer"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between text-sm">
              <span>Expiry</span>
              <select
                className="bg-(--bg-color-extrathin) cursor-pointer rounded-lg px-2 py-1 text-sm outline-none"
                value={expiresInHours ?? ""}
                onChange={(e) =>
                  setExpiresInHours(
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
              >
                {EXPIRY_OPTIONS.map((o) => (
                  <option key={o.label} value={o.hours ?? ""}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="bg-linear-to-br from-light-blue-300 to-light-blue-500 cursor-pointer rounded-lg py-2 text-sm
                font-medium text-white disabled:opacity-50"
              disabled={saving}
              onClick={create}
            >
              Create invite link
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InformationInvite;
