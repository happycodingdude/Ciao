import { createFileRoute } from "@tanstack/react-router";
import LoadingProvider from "../context/LoadingContext";
import { SignalProvider } from "../context/SignalContext";
import Home from "../pages/Home";

export const Route = createFileRoute("/")({
  component: Home,
});

function Component() {
  return (
    <LoadingProvider>
      <SignalProvider>
        <Home />
      </SignalProvider>
    </LoadingProvider>
  );
}
