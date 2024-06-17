import { HttpRequest } from "../common/Utility";

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

export const signin = async (username, password) => {
  return (
    await HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_SIGNIN,
      data: {
        Username: username,
        Password: password,
      },
    })
  ).headers;
};

export const forgotPassword = async (username, password) => {
  return await HttpRequest({
    method: "post",
    url: import.meta.env.VITE_ENDPOINT_FORGOT,
    data: {
      Username: username,
      Password: password,
    },
  });
};

export const signout = async () => {
  return await HttpRequest({
    method: "get",
    url: import.meta.env.VITE_ENDPOINT_SIGNOUT,
    token: localStorage.getItem("token"),
  });
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

export const updateInfo = async (id, name, bio, avatar) => {
  const body = [
    {
      op: "replace",
      path: "name",
      value: name,
    },
    {
      op: "replace",
      path: "bio",
      value: bio,
    },
    {
      op: "replace",
      path: "avatar",
      value: avatar,
    },
  ];
  return HttpRequest({
    method: "patch",
    url: import.meta.env.VITE_ENDPOINT_CONTACT_GETBYID.replace("{id}", id),
    token: localStorage.getItem("token"),
    data: body,
    alert: true,
  });
};
