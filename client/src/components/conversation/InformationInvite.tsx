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

// dd/MM/yyyy HH:mm — định dạng cố định, không phụ thuộc locale trình duyệt.
const formatExpiry = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
};

// Thời gian còn lại tới hạn cho dòng tóm tắt khi thu gọn: "2d 5h" / "23h 58m" /
// "45m" / "<1m". Trả null nếu đã hết hạn (tính tại thời điểm render).
const formatTimeLeft = (iso: string) => {
  const totalMin = Math.floor((new Date(iso).getTime() - Date.now()) / 60000);
  if (totalMin < 0) return null;
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return "<1m";
};

// Kim xoay quanh tâm (12,12) — transform-box:view-box để gốc xoay theo viewBox chứ
// không theo bbox của line. Mặt đồng hồ + vạch giờ để mờ cho 2 kim (đậm) nổi bật lên.
const SPIN = { transformBox: "view-box", transformOrigin: "center" } as const;
const ExpiryClock = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4 shrink-0 drop-shadow-sm"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Mặt đồng hồ + vạch 12/3/6/9 (tĩnh, mờ) */}
    <g opacity="0.45">
      <circle cx="12" cy="12" r="9.25" />
      <path d="M12 3.75v1.5M20.25 12h-1.5M12 20.25v-1.5M3.75 12h1.5" />
    </g>
    {/* Kim giờ: ngắn, đậm — 1 vòng/6s */}
    <line
      x1="12"
      y1="12"
      x2="12"
      y2="8.25"
      strokeWidth="2.4"
      className="animate-spin"
      style={{ ...SPIN, animationDuration: "6s" }}
    />
    {/* Kim phút: dài, mảnh — 1 vòng/2s */}
    <line
      x1="12"
      y1="12"
      x2="12"
      y2="5.5"
      strokeWidth="1.75"
      className="animate-spin"
      style={{ ...SPIN, animationDuration: "2s" }}
    />
    {/* Trục tâm */}
    <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
  </svg>
);

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

  // Thời gian còn lại cho dòng tóm tắt thu gọn (null = vĩnh viễn hoặc đã hết hạn).
  const timeLeft = invite?.expireTime ? formatTimeLeft(invite.expireTime) : null;

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
      {/* Thu gọn: dòng tóm tắt gọn (link + hạn dùng + copy) thay cho khoảng trắng.
          Bấm vào dòng để mở lại; nút copy chặn propagation để không mở panel. */}
      {!showInvite && invite && link && (
        <div
          className="bg-(--bg-color-extrathin) flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs"
          title="Expand invite link"
          onClick={() => setShowInvite(true)}
        >
          <i className="fa-solid fa-link base-icon-sm shrink-0 opacity-50"></i>
          <p className="min-w-0 grow truncate font-medium opacity-80">
            {link.replace(/^https?:\/\//, "")}
          </p>
          {invite.expireTime ? (
            invite.expired || !timeLeft ? (
              <span
                className="flex shrink-0 items-center gap-1 font-semibold text-red-500"
                title="Link has expired"
              >
                <i className="fa-solid fa-triangle-exclamation text-3xs"></i>
                Expired
              </span>
            ) : (
              <span
                className="text-light-blue-500 flex shrink-0 items-center gap-1 font-semibold"
                title={`Expires in ${timeLeft}`}
              >
                <ExpiryClock />
                <span className="whitespace-nowrap">{timeLeft}</span>
              </span>
            )
          ) : (
            <span
              className="flex shrink-0 items-center gap-1 font-semibold text-emerald-500"
              title="Never expires"
            >
              <i className="fa-solid fa-infinity text-3xs"></i>
              No expiry
            </span>
          )}
          <button
            className="shrink-0 cursor-pointer"
            title="Copy invite link"
            onClick={(e) => {
              e.stopPropagation();
              copy();
            }}
          >
            <i className="fa fa-copy base-icon-sm hover:text-light-blue-500"></i>
          </button>
        </div>
      )}
      <div
        data-show={showInvite}
        className="flex flex-col gap-3 overflow-hidden transition-all duration-500 data-[show=false]:max-h-0
          data-[show=false]:opacity-0 data-[show=true]:opacity-100"
      >
        {isLoading ? (
          <p className=" opacity-60">Loading…</p>
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
              <p className="grow truncate ">{link}</p>
              <i className="fa fa-copy base-icon-sm hover:text-light-blue-500"></i>
            </div>
            <div className="flex flex-col items-start gap-2">
              <p className="opacity-60">
                {invite.requireApproval
                  ? "New members must be approved by an admin."
                  : "Anyone with the link joins instantly."}
              </p>
              {invite.expired ? (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1
                    text-xs font-semibold text-red-500"
                >
                  <i className="fa-solid fa-triangle-exclamation text-3xs"></i>
                  Link has expired
                </span>
              ) : invite.expireTime ? (
                <span
                  className="text-light-blue-500 bg-light-blue-500/10 inline-flex items-center gap-1.5
                    rounded-full px-3 py-1 text-xs font-semibold"
                >
                  <ExpiryClock />
                  {formatExpiry(invite.expireTime)}
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1
                    text-xs font-semibold text-emerald-500"
                >
                  <i className="fa-solid fa-infinity text-3xs"></i>
                  Never expires
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className="bg-(--bg-color-extrathin) hover:text-light-blue-500 grow cursor-pointer rounded-lg py-2 
                  font-medium disabled:opacity-50"
                disabled={saving}
                onClick={create}
              >
                New link
              </button>
              <button
                className="bg-(--bg-color-extrathin) grow cursor-pointer rounded-lg py-2  font-medium text-red-500
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
            <label className="flex cursor-pointer items-center justify-between ">
              <span>Require admin approval</span>
              <input
                type="checkbox"
                className="accent-light-blue-500 h-4 w-4 cursor-pointer"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between ">
              <span>Expiry</span>
              <select
                className="bg-(--bg-color-extrathin) cursor-pointer rounded-lg px-2 py-1  outline-none"
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
              className="bg-linear-to-br from-light-blue-300 to-light-blue-500 cursor-pointer rounded-lg py-2 
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
