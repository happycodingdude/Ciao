import { createFileRoute } from "@tanstack/react-router";
import Invite from "../pages/Invite";

// Phase 5 — Đợt 2: trang tham gia nhóm qua link mời /invite/{code}.
// Nằm trong _layout → yêu cầu đăng nhập (redirect /auth nếu chưa có phiên).
export const Route = createFileRoute("/_layout/invite/$code")({
  component: Invite,
});
