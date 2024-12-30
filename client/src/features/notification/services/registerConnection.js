import HttpRequest from "../../../lib/fetch";

const registerConnection = async (token) => {
  return (
    await HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_REGISTER.replace(
        "{token}",
        token,
      ),
    })
  ).data;
};
export default registerConnection;
