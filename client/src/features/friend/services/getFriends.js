import HttpRequest from "../../../lib/fetch";

const getFriends = async () => {
  return (
    await HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_GET,
    })
  ).data;
};
export default getFriends;
