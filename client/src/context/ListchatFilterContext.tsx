import { useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, useEffect, useState } from "react";
import useInfo from "../features/authentication/hooks/useInfo";
import { ConversationCache } from "../features/listchat/types";
import { ListchatFilterType } from "../types";

// Create the context
export const ListchatFilterContext = createContext<
  ListchatFilterType | undefined
>(undefined);

// Provider component
const ListchatFilterProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const { data: info } = useInfo();

  // const listChat = useRef([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    queryClient.setQueryData(["conversation"], (oldData: ConversationCache) => {
      if (!oldData) return oldData;
      const filteredConversations = oldData.conversations.filter((conv) =>
        filter === "all"
          ? true
          : filter === "direct"
            ? !conv.isGroup
            : conv.isGroup,
      );
      const updatedConversations =
        search === ""
          ? filteredConversations
          : filteredConversations.filter((conv) =>
              conv.isGroup
                ? conv.title.toLowerCase().includes(search.toLowerCase())
                : conv.members
                    .find((item) => item.contact.id !== info.id)
                    ?.contact.name.toLowerCase()
                    .includes(search.toLowerCase()),
            );
      return {
        ...oldData,
        filterConversations: updatedConversations,
        // conversations: updatedConversations,
        noLazy: true,
      };
    });
  }, [search, filter]);

  return (
    <ListchatFilterContext.Provider
      value={{ filter, setFilter, search, setSearch }}
    >
      {children}
    </ListchatFilterContext.Provider>
  );
};

export default ListchatFilterProvider;
