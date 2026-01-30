import HttpRequest from "../lib/fetch";
import {
  ContactModel,
  CreateDirectChatReq,
  CreateDirectChatRes,
  FriendCache,
} from "../types/friend.types";

export const createDirectChat = async (contactId: string) => {
  return (
    await HttpRequest<undefined, CreateDirectChatRes>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_CREATE_DIRECT.replace(
        "{contact-id}",
        contactId,
      ),
    })
  ).data;
};

export const createDirectChatWithMessage = async (
  contactId: string,
  request: CreateDirectChatReq,
) => {
  return (
    await HttpRequest<CreateDirectChatReq, CreateDirectChatRes>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_CONVERSATION_CREATE_DIRECT_WITH_MESSAGE.replace(
        "{contact-id}",
        contactId,
      ),
      data: request,
    })
  ).data;
};

export const getContacts = async (name: string) => {
  return (
    await HttpRequest<undefined, ContactModel[]>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_CONTACT_GETBYNAME.replace(
        "{name}",
        name,
      ),
    })
  ).data;
};

export const getFriends = async () => {
  return (
    await HttpRequest<undefined, FriendCache[]>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_GET,
    })
  ).data;
};
