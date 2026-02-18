import { createFileRoute } from "@tanstack/react-router";
import Home from "../pages/Home";
import Notification from "../pages/Notification";

export const Route = createFileRoute("/_layout/notifications")({
  component: Notification,
});
