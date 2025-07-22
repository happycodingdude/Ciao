import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/conversations/_layout/")({
  // component: lazy(() => import("../../layouts/ChatSection")),
  component: () => <div>Conversations here</div>,
});
