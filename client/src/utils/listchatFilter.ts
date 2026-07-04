import { ConversationModel } from "../types/conv.types";

/**
 * Áp filter tab (all/direct/group) + search theo tên lên danh sách conversation.
 * Dùng chung cho ListchatFilterContext (khi đổi filter/search) và load-more của
 * ListChatContainer (khi append trang mới phải tôn trọng filter đang active).
 */
export const applyListchatFilter = (
  conversations: ConversationModel[],
  filter: string,
  search: string,
  selfId?: string,
): ConversationModel[] => {
  const byTab = conversations.filter((conv) =>
    filter === "all" ? true : filter === "direct" ? !conv.isGroup : conv.isGroup,
  );
  if (search === "") return byTab;
  return byTab.filter((conv) =>
    conv.isGroup
      ? (conv.title ?? "").toLowerCase().includes(search.toLowerCase())
      : (conv.members ?? [])
          .find((item) => item.contact?.id !== selfId)
          ?.contact?.name?.toLowerCase()
          .includes(search.toLowerCase()),
  );
};
