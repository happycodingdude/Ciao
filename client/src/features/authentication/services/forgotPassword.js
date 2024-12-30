import HttpRequest from "../../../lib/fetch";

const forgotPassword = async (username, password) => {
  return await HttpRequest({
    method: "post",
    url: import.meta.env.VITE_ENDPOINT_FORGOT,
    data: {
      Username: username,
      Password: password,
    },
  });
};
export default forgotPassword;
