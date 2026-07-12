import HttpRequest from "../lib/fetch";
import {
  InviteModel,
  InvitePreview,
  JoinByInviteResult,
  JoinRequestModel,
} from "../types/invite.types";

// Phase 5 — Đợt 2: Link mời & QR + Yêu cầu tham gia.

// Quản trị xem link mời hiện tại (invite: null = chưa tạo/đã thu hồi).
export const getGroupInvite = async (conversationId: string) => {
  return (
    await HttpRequest<undefined, { invite: InviteModel | null }>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_INVITE_GET.replace(
        "{id}",
        conversationId,
      ),
    })
  ).data;
};

// Tạo link mới (thay code cũ nếu đã có — link cũ vô hiệu ngay).
export const createGroupInvite = async (
  conversationId: string,
  requireApproval: boolean,
  expiresInHours: number | null,
) => {
  return (
    await HttpRequest<
      { requireApproval: boolean; expiresInHours: number | null },
      { invite: InviteModel }
    >({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_INVITE_GET.replace(
        "{id}",
        conversationId,
      ),
      data: { requireApproval, expiresInHours },
    })
  ).data;
};

// Thu hồi link mời — mọi lượt mở/join theo link cũ bị từ chối ngay.
export const revokeGroupInvite = async (conversationId: string) => {
  return (
    await HttpRequest({
      method: "delete",
      url: import.meta.env.VITE_ENDPOINT_INVITE_GET.replace(
        "{id}",
        conversationId,
      ),
    })
  ).data;
};

// Người có link xem preview nhóm (tên, avatar, số thành viên, trạng thái của mình).
export const getInvitePreview = async (code: string) => {
  return (
    await HttpRequest<undefined, InvitePreview>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_INVITE_PREVIEW.replace("{code}", code),
    })
  ).data;
};

// Bấm "Tham gia" — joined (vào thẳng) | pending (chờ duyệt) | member (đã ở trong nhóm).
export const joinByInvite = async (code: string) => {
  return (
    await HttpRequest<undefined, JoinByInviteResult>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_INVITE_JOIN.replace("{code}", code),
    })
  ).data;
};

// Quản trị xem hàng chờ yêu cầu tham gia.
export const getJoinRequests = async (conversationId: string) => {
  return (
    await HttpRequest<undefined, JoinRequestModel[]>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_JOINREQUEST_GET.replace(
        "{id}",
        conversationId,
      ),
    })
  ).data;
};

// Quản trị duyệt (approved=true) / từ chối (approved=false) một yêu cầu.
export const reviewJoinRequest = async (
  conversationId: string,
  contactId: string,
  approved: boolean,
) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_JOINREQUEST_REVIEW.replace(
        "{id}",
        conversationId,
      )
        .replace("{contactId}", contactId)
        .replace("{approved}", String(approved)),
    })
  ).data;
};

// Người xin rút yêu cầu của chính mình trước khi được duyệt (lookup theo code —
// người xin chưa là thành viên nên không có conversationId).
export const withdrawJoinRequest = async (code: string) => {
  return (
    await HttpRequest({
      method: "delete",
      url: import.meta.env.VITE_ENDPOINT_INVITE_JOIN.replace("{code}", code),
    })
  ).data;
};
