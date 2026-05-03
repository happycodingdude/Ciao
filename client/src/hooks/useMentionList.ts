import { useCallback, useState } from "react";
import { ConversationModel_Member } from "../types/conv.types";
import { MentionModel } from "../types/message.types";

const ALL_MENTION: MentionModel = { name: "All", avatar: null, userId: "all" };

const buildMentionList = (
  members: ConversationModel_Member[],
  selfId: string,
): MentionModel[] => [
  ALL_MENTION,
  ...members
    .filter((m) => m.contact?.id !== selfId)
    .map((m) => ({
      name: m.contact?.name ?? "",
      avatar: m.contact?.avatar ?? null,
      userId: m.contact?.id ?? "",
    })),
];

export const useMentionList = (
  members: ConversationModel_Member[],
  selfId: string,
) => {
  const [mentions, setMentions] = useState<MentionModel[]>(() =>
    buildMentionList(members, selfId),
  );

  const resetMentions = useCallback(() => {
    setMentions(buildMentionList(members, selfId));
  }, [members, selfId]);

  const filterMentions = useCallback(
    (searchText: string) => {
      const list = buildMentionList(members, selfId);
      setMentions(
        searchText
          ? list.filter((m) =>
              m.name.toLowerCase().includes(searchText.toLowerCase()),
            )
          : list,
      );
    },
    [members, selfId],
  );

  return { mentions, resetMentions, filterMentions };
};
