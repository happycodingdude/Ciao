import HttpRequest from "../../../lib/fetch";

const updateInfo = async (name, bio, avatar) => {
  const body = {
    name: name,
    bio: bio,
    avatar: avatar,
  };
  await HttpRequest({
    method: "put",
    url: import.meta.env.VITE_ENDPOINT_CONTACT_GET,
    data: body,
    alert: true,
  });
  return avatar;
};

export default updateInfo;
