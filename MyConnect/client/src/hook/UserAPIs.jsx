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
  });
};

export const getInfo = async () => {
  return await HttpRequest({
    method: "get",
    url: import.meta.env.VITE_ENDPOINT_INFO,
    timeout: 1000,
  });
};

export const updateInfo = async (name, bio, avatar) => {
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
