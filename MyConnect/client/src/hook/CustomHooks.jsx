import { useContext, useEffect, useState } from "react";
import { HttpRequest } from "../common/Utility";
import AuthContext from "../context/AuthContext";
import ParticipantContext from "../context/ParticipantContext";

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
  // const auth = useAuth();
  // const [participants, setParticipants] = useState();
  // const getParticipants = useCallback((id, controller) => {
  //   HttpRequest({
  //     method: "get",
  //     url: `api/conversations/${id}/participants`,
  //     token: auth.token,
  //     // controller: controller,
  //   }).then((res) => {
  //     setParticipants(res);
  //   });
  // }, []);
  // useEffect(() => {
  //   getParticipants();
  // }, [getParticipants]);
  // return { participants, reFetch: getParticipants };
};

export const useFetchFriends = () => {
  const auth = useAuth();
  const load = () => {
    return HttpRequest({
      method: "get",
      url: `api/contacts/${auth.id}/friends`,
      token: auth.token,
    });
  };
  return { load };
};

export const useFetchAttachments = () => {
  const auth = useAuth();
  const [attachments, setAttachments] = useState();
  const [displayAttachments, setDisplayAttachments] = useState();
  const getAttachments = (id, controller) => {
    HttpRequest({
      method: "get",
      url: `api/conversations/${id}/attachments`,
      token: auth.token,
      controller: controller,
    }).then((res) => {
      setAttachments(res);
      setDisplayAttachments(res[0]?.Attachments.slice(0, 8));
    });
  };
  return { attachments, displayAttachments, reFetch: getAttachments };
};

export const useDeleteChat = () => {
  const auth = useAuth();
  const deleteChat = (id, participants) => {
    const selected = participants.find((item) => item.ContactId === auth.id);
    selected.IsDeleted = true;
    return HttpRequest({
      method: "delete",
      url: `api/conversations/${id}/participantsss`,
      token: auth.token,
      data: selected,
    });
  };
  return { deleteChat };
};
