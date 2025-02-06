import HttpRequest from "../../../lib/fetch";

interface SigninRequest {
  username: string;
  password: string;
}

const signin = async (model: SigninRequest) => {
  return await HttpRequest({
    method: "post",
    url: import.meta.env.VITE_ENDPOINT_SIGNIN,
    data: model,
  });
};

export default signin;
