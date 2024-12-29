import HttpRequest from "../../../lib/fetch";

const page = 1;
const limit = 10;

const getNotifications = async () => {
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

export default getNotifications;
