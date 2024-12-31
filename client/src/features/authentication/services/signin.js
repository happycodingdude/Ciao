import { HttpRequestNoRetry } from "../../../lib/fetch";

const signin = async (username, password) => {
  return await HttpRequestNoRetry({
    method: "post",
    url: import.meta.env.VITE_ENDPOINT_SIGNIN,
    data: {
      Username: username,
      Password: password,
    },
  });
};

export default signin;
