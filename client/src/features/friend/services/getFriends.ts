import HttpRequest from "../../../lib/fetch";
import { FriendCache } from "../types";

const getFriends = async () => {
  return (
    await HttpRequest<undefined, FriendCache[]>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_GET,
    })
  ).data;
};
export default getFriends;
