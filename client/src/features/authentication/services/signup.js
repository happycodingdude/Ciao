import { HttpRequest } from "../../../lib/fetch";

const signup = async (name, username, password) => {
  return await HttpRequest({
    method: "post",
    url: import.meta.env.VITE_ENDPOINT_SIGNUP,
    data: {
      Name: name,
      Username: username,
      Password: password,
    },
  });
};
export default signup;
