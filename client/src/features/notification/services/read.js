import HttpRequest from "../../../lib/fetch";

const read = async (id) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_NOTIFICATION_GETBYID.replace(
        "{id}",
        id,
      ),
    })
  ).data;
};
export default read;
