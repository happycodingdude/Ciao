import { useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, useEffect, useState } from "react";
import useInfo from "../hooks/useInfo";
import { ListchatFilterType } from "../types/base.types";
import { ConversationCache } from "../types/conv.types";
import { applyListchatFilter } from "../utils/listchatFilter";

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
      return {
        ...oldData,
        filterConversations: applyListchatFilter(
          oldData.conversations ?? [],
          filter,
          search,
          info?.id,
        ),
        // Ghi filter/search đang active vào cache để load-more append đúng bộ lọc
        listFilter: filter,
        listSearch: search,
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
