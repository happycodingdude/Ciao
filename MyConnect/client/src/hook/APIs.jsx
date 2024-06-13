import { HttpRequest } from "../common/Utility";

export const login = async (username, password) => {
  return (
    await HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_SIGNIN,
      data: {
        Username: username,
        Password: password,
      },
      // alert: true,
    })
  ).headers;
};

export const getInfo = async () => {
  return (
    await HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_INFO,
      token: localStorage.getItem("token"),
    })
  ).data;
};
