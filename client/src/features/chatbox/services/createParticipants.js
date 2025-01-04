import HttpRequest from "../../../lib/fetch";

const createParticipants = async (id, participants) => {
  return (
    await HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_PARTICIPANT_GET.replace("{id}", id),
      data: participants,
    })
  ).data;
};

export default createParticipants;
