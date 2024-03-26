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
  const deleteChat = (id, participants) => {
    const selected = participants.find((item) => item.ContactId === auth.id);
    selected.IsDeleted = true;
    return HttpRequest({
      method: "delete",
      url: `api/conversations/${id}/participants`,
      token: auth.token,
      data: selected,
    });
  };
  return { deleteChat };
};
