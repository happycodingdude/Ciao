import { createFileRoute, redirect } from "@tanstack/react-router";

// Phase 5 — Đợt 2: link tham gia nhóm /invite/{code}.
// Không render trang riêng (nền trắng che hết app) — redirect về danh sách hội thoại kèm
// ?invite={code}; InviteJoinModal (mount ở _layout) đọc param và hiện portal modal đè lên
// trang, giữ nguyên hiện trạng bên dưới. Nằm trong _layout → vẫn yêu cầu đăng nhập.
export const Route = createFileRoute("/_layout/invite/$code")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/conversations",
      search: { invite: params.code },
      replace: true,
    });
  },
});
