import HttpRequest from "../../../lib/fetch";
import { RefreshRequest, TokenModel } from "../../../types";

const refreshToken = async (model: RefreshRequest) => {
  return (
    await HttpRequest<RefreshRequest, TokenModel>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_REFRESH,
      data: model,
    })
  ).data;
};

export default refreshToken;
