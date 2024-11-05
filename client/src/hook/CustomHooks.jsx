import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { HttpRequest } from "../common/Utility";
import AttachmentContext from "../context/AttachmentContext";
import AuthContext from "../context/AuthContext";
import ConversationContext from "../context/ConversationContext";
import FriendContext from "../context/FriendContext";
import LoadingContext from "../context/LoadingContext";
import MessageContext from "../context/MessageContext";
import ParticipantContext from "../context/ParticipantContext";
import ProfileContext from "../context/ProfileContext";
import { getAttachments } from "./AttachmentAPIs";
import { getConversation } from "./ConversationAPIs";
import { getMessages } from "./MessageAPIs";
import { getNotification } from "./NotificationAPIs";
import { getParticipants } from "./ParticipantAPIs";
import { getInfo } from "./UserAPIs";

export const useLocalStorage = (key) => {
  const [value, setValue] = useState(() => {
    return localStorage.getItem(key);
  });
  useEffect(() => {
    if (!value) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }, [key, value]);
  return [value, setValue];
};

export const useInfo = () => {
  return useQuery({
    queryKey: ["info"],
    queryFn: getInfo,
    staleTime: Infinity,
    // enabled: false,
  });
};

export const useNotification = () => {
  return useQuery({
    queryKey: ["notification"],
    queryFn: getNotification,
    staleTime: Infinity,
    enabled: false,
  });
};

export const useConversation = (page) => {
  return useQuery({
    queryKey: ["conversation"],
    queryFn: () => getConversation(page),
    staleTime: Infinity,
    // enabled: false,
  });
};

export const useParticipant = (conversationId) => {
  return useQuery({
    queryKey: ["participant"],
    queryFn: () => getParticipants(conversationId),
    staleTime: Infinity,
    enabled: false,
  });
};

export const useMessage = (conversationId, page) => {
  return useQuery({
    queryKey: ["message"],
    queryFn: () => getMessages(conversationId, page),
    staleTime: Infinity,
    enabled: false,
  });
};

export const useAttachment = (conversationId) => {
  return useQuery({
    queryKey: ["attachment"],
    queryFn: () => getAttachments(conversationId),
    staleTime: Infinity,
    enabled: false,
  });
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export const useEventListener = (event, callback, element = window) => {
  if (!element || !element.addEventListener) return;
  useEffect(() => {
    element.addEventListener(event, callback, true);
    return () => {
      element.removeEventListener(event, callback, true);
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

export const useLoading = () => {
  return useContext(LoadingContext);
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
