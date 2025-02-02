import HttpRequest from "../../../lib/fetch";

const createGroupChat = async (title, avatar, membersToAdd) => {
  return await HttpRequest({
    method: "post",
    url: import.meta.env.VITE_ENDPOINT_CONVERSATION_CREATE,
    data: {
      title: title,
      avatar: avatar,
      members: membersToAdd.map((mem) => {
        return {
          contactId: mem.id,
        };
      }),
    },
  });
};
export default createGroupChat;
