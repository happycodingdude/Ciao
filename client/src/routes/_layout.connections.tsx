import { createFileRoute } from "@tanstack/react-router";
import Connection from "../pages/Connection";

export const Route = createFileRoute("/_layout/connections")({
  component: Connection,
});
