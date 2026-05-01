import {
  ConversationCache,
  ConversationModel,
  ConversationModel_Member,
} from "../types/conv.types";
import { UserProfile } from "../types/base.types";
import { ContactModel } from "../types/friend.types";

/** Tạo optimistic id (5 ký tự random) */
export const optimisticId = () =>
  Math.random().toString(36).substring(2, 7);

/** Sync conversations và filterConversations trong cache */
export const syncConversations = (
  oldData: ConversationCache,
  updated: ConversationModel[],
): ConversationCache => ({
  ...oldData,
  conversations: updated,
  filterConversations: updated,
});

/** Prepend một conversation mới lên đầu danh sách */
export const prependConversation = (
  oldData: ConversationCache,
  conversation: ConversationModel,
): ConversationCache =>
  syncConversations(oldData, [
    conversation,
    ...(oldData.conversations ?? []).filter((c) => c.id !== conversation.id),
  ]);

/** Replace một temp id với id thật */
export const replaceConversationId = (
  oldData: ConversationCache,
  tempId: string,
  realId: string,
): ConversationCache => {
  const updated = (oldData.conversations ?? []).map((c) =>
    c.id === tempId ? { ...c, id: realId } : c,
  );
  return syncConversations(oldData, updated);
};

/** Tìm direct conversation (1-1) với một contact */
export const findDirectConversation = (
  conversations: ConversationModel[],
  contactId: string,
): ConversationModel | undefined =>
  conversations.find(
    (c) =>
      c.isGroup === false &&
      (c.members ?? []).some((m) => m.contact?.id === contactId),
  );

/** Đánh dấu member trong conversation là undeleted */
export const reopenMember = (
  members: ConversationModel_Member[],
  userId: string,
): ConversationModel_Member[] =>
  members.map((m) =>
    m.contact?.id !== userId ? m : { ...m, isDeleted: false },
  );

/** Tạo ConversationModel optimistic cho direct chat */
export const buildOptimisticConversation = (
  id: string,
  me: UserProfile,
  contact: Pick<ContactModel, "id" | "name" | "avatar" | "isOnline">,
  extra?: Partial<ConversationModel>,
): ConversationModel => ({
  id,
  isGroup: false,
  isNotifying: true,
  members: [
    {
      isModerator: true,
      contact: {
        id: me.id,
        name: me.name,
        avatar: me.avatar,
        isOnline: true,
      },
    },
    {
      contact: {
        id: contact.id,
        name: contact.name,
        avatar: contact.avatar,
        isOnline: contact.isOnline,
      },
    },
  ],
  ...extra,
});
