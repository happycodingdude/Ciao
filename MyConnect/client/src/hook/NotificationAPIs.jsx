import { HttpRequest } from "../common/Utility";

const page = 1;
const limit = 10;

export const getNotification = async () => {
  return (
    await HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_GET.replace(
        "{page}",
        page,
      ).replace("{limit}", limit),
    })
  ).data;
};

export const read = async (id) => {
  return (
    await HttpRequest({
      method: "patch",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_GETBYID.replace(
        "{id}",
        id,
      ),
      data: [
        {
          op: "replace",
          path: "read",
          value: true,
        },
      ],
    })
  ).data;
};

export const readAll = async (ids) => {
  return (
    await HttpRequest({
      method: "patch",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_BULKEDIT,
      data: ids.map((id) => {
        return {
          id: id,
          patchDocument: [
            {
              op: "replace",
              path: "read",
              value: true,
            },
          ],
        };
      }),
    })
  ).data;
};

export const registerConnection = async (id, token) => {
  return (
    await HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_REGISTER,
      data: {
        id: id,
        token: token,
      },
    })
  ).data;
};

export const notifyMessage = (message) => {
  console.log(message);
  const messageData =
    message.data === undefined ? undefined : JSON.parse(message.data);
  switch (
    message.event
    // case "NewMessage":
    //   refListChat.newMessage(messageData);
    //   if (refChatbox.newMessage) refChatbox.newMessage(messageData);
    //   break;
    // case "AddMember":
    //   const listChat = Array.from(document.querySelectorAll(".chat-item"));
    //   const oldChat = listChat.find(
    //     (item) => item.dataset.key === messageData.Id,
    //   );
    //   // Old chat and is focused
    //   if (oldChat && oldChat.classList.contains("item-active"))
    //     reFetchParticipants(messageData.Id);
    //   else reFetchConversations();
    //   break;
    // case "NewConversation":
    //   reFetchConversations();
    //   break;
    // case "NewFriendRequest":
    //   reFetchRequestById(messageData.RequestId);
    //   break;
    // case "AcceptFriendRequest":
    //   reFetchRequestById(messageData.RequestId);
    //   reFetchFriends();
    //   break;
    // case "CancelFriendRequest":
    //   reFetchRequest(messageData.ContactId);
    //   break;
    // case "NewNotification":
    //   reFetchNotifications();
    //   break;
    // default:
    //   break;
  ) {
  }
};
