import { HttpRequest } from "../lib/fetch";

export const signup = async (name, username, password) => {
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

export const signout = async () => {
  return await HttpRequest({
    method: "get",
    url: import.meta.env.VITE_ENDPOINT_SIGNOUT,
  });
};
