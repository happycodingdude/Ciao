
import HttpRequest from "../../../lib/fetch";
import { SignupRequest } from "../../../types";

const signup = async (model: SignupRequest) => {
  return await HttpRequest<SignupRequest>({
    method: "post",
    url: import.meta.env.VITE_ENDPOINT_SIGNUP,
    data: model,
  });
};
export default signup;
