import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useEffect, useState } from "react";
import useInfo from "../features/authentication/hooks/useInfo";

// Create the context
export const ListchatFilterContext = createContext();

// Provider component
const ListchatFilterProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: info } = useInfo();

  // const listChat = useRef([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    queryClient.setQueryData(["conversation"], (oldData) => {
      if (!oldData) return oldData;
      const filteredListChat = oldData.conversations.filter((conv) =>
        filter === "all"
          ? true
          : filter === "direct"
            ? !conv.isGroup
            : conv.isGroup,
      );
      return {
        ...oldData,
        filterConversations:
          search === ""
            ? filteredListChat
            : filteredListChat.filter((conv) =>
                conv.isGroup
                  ? conv.title.toLowerCase().includes(search.toLowerCase())
                  : conv.participants
                      .find((item) => item.contact.id !== info.id)
                      ?.contact.name.toLowerCase()
                      .includes(search.toLowerCase()),
              ),
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
