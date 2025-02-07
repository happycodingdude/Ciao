import HttpRequest from "../../../lib/fetch";
import { SigninRequest, TokenModel } from "../../../types";

const signin = async (model: SigninRequest) => {
  return (
    await HttpRequest<SigninRequest, TokenModel>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_SIGNIN,
      data: model,
    })
  ).data;
};

export default signin;
