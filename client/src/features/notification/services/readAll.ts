import HttpRequest from "../../../lib/fetch";

const readAll = async () => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_GET,
    })
  ).data;
};
export default readAll;
