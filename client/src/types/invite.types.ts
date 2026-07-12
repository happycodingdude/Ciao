// Phase 5 — Đợt 2: Link mời & QR + Yêu cầu tham gia.

// Link mời hiện tại của nhóm (quản trị xem/tạo). expired do BE tính (tránh lệch giờ client).
export type InviteModel = {
  code: string;
  requireApproval: boolean;
  expireTime?: string | null;
  createdTime: string;
  expired: boolean;
};

// Preview khi mở /invite/{code}. invalid/expired → không có thông tin nhóm.
export type InvitePreview = {
  status: "active" | "invalid" | "expired";
  conversationId?: string | null; // chỉ có khi đã là thành viên
  title?: string | null;
  avatar?: string | null;
  memberCount: number;
  requireApproval: boolean;
  isMember: boolean;
  hasPendingRequest: boolean;
};

// Kết quả bấm Join. joined = vào thẳng (hội thoại sẽ tới qua event realtime NewMembers);
// pending = chờ quản trị duyệt; member = đã ở trong nhóm từ trước.
export type JoinByInviteResult = {
  status: "joined" | "pending" | "member";
  conversationId?: string | null;
  title?: string | null;
};

// 1 yêu cầu tham gia trong hàng chờ (quản trị duyệt/từ chối).
export type JoinRequestModel = {
  contactId: string;
  name: string;
  avatar: string;
  requestedTime: string;
};
