import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/conversations/")({
  // ?invite={code} — đích redirect của /invite/{code}; InviteJoinModal (mount ở _layout)
  // đọc param này để hiện modal tham gia nhóm đè lên trang.
  validateSearch: (search: Record<string, unknown>): { invite?: string } => ({
    invite: typeof search.invite === "string" ? search.invite : undefined,
  }),
  component: () => null,
});
