import { HttpRequest } from "../lib/fetch";

export const getParticipants = async (conversationId) => {
  return (
    await HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_PARTICIPANT_GET.replace(
        "{id}",
        conversationId,
      ),
    })
  ).data;
};
