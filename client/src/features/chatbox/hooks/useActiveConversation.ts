import { useSyncExternalStore } from "react";

let activeConversationId: string | null = null;
const listeners = new Set<() => void>();

export function setActiveConversation(id: string | null) {
  activeConversationId = id;
  listeners.forEach((l) => l());
}

export function useActiveConversation() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => activeConversationId,
  );
}

export function isConversationActive(conversationId: string) {
  return activeConversationId === conversationId;
}
