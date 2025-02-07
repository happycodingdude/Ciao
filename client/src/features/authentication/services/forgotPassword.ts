import HttpRequest from "../../../lib/fetch";
import { SigninRequest } from "../../../types";

const forgotPassword = async (model: SigninRequest) => {
  return await HttpRequest<SigninRequest>({
    method: "post",
    url: import.meta.env.VITE_ENDPOINT_FORGOT,
    data: model,
  });
};
export default forgotPassword;
