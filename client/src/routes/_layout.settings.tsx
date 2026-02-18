import { createFileRoute } from "@tanstack/react-router";
import Setting from "../pages/Setting";

export const Route = createFileRoute("/_layout/settings")({
  component: Setting,
});
