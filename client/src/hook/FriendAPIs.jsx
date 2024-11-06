import { HttpRequest } from "../common/Utility";

export const getFriends = async () => {
  return (
    await HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_GET,
    })
  ).data;
};
