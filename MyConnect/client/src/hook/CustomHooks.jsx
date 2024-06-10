import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { HttpRequest } from "../common/Utility";
import AttachmentContext from "../context/AttachmentContext";
import AuthContext from "../context/AuthContext";
import ConversationContext from "../context/ConversationContext";
import FriendContext from "../context/FriendContext";
import MessageContext from "../context/MessageContext";
import NotificationContext from "../context/NotificationContext";
import ParticipantContext from "../context/ParticipantContext";
import ProfileContext from "../context/ProfileContext";

export const useLocalStorage = (key) => {
  const [value, setValue] = useState(() => {
    return JSON.parse(localStorage.getItem(key));
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

export const useInfo = () => {
  const [token, setToken] = useLocalStorage("token");
  return useQuery({
    queryKey: ["user", token],
    queryFn: async () => {
      const result = await HttpRequest({
        method: "get",
        url: import.meta.env.VITE_ENDPOINT_INFO,
        token: token,
      });
      return result.data;
    },
    enabled: !!token, // Chỉ kích hoạt query khi có token
  });
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export const useEventListener = (event, callback, element = window) => {
  if (!element || !element.addEventListener) return;
  useEffect(() => {
    element.addEventListener(event, callback);
    return () => {
      element.removeEventListener(event, callback);
    };
  }, [event, callback, element]);
};

export const useFetchParticipants = () => {
  return useContext(ParticipantContext);
};

export const useFetchMessages = () => {
  return useContext(MessageContext);
};

export const useFetchConversations = () => {
  return useContext(ConversationContext);
};

export const useFetchAttachments = () => {
  return useContext(AttachmentContext);
};

export const useFetchProfile = () => {
  return useContext(ProfileContext);
};

export const useFetchFriends = () => {
  return useContext(FriendContext);
};

export const useFetchNotifications = () => {
  return useContext(NotificationContext);
};

export const useDeleteChat = () => {
  const auth = useAuth();
  const deleteChat = (participants) => {
    const selected = participants.find((item) => item.contactId === auth.id);
    const body = [
      {
        op: "replace",
        path: "isDeleted",
        value: true,
      },
    ];
    return HttpRequest({
      method: "patch",
      url: import.meta.env.VITE_ENDPOINT_PARTICIPANT_GETBYID.replace(
        "{id}",
        selected.id,
      ),
      token: auth.token,
      data: body,
    });
  };
  return { deleteChat };
};
