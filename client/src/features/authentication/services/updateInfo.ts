import HttpRequest from "../../../lib/fetch";
import { UpdateProfileRequest } from "../../../types";

const updateInfo = async (model: UpdateProfileRequest) => {
  return await HttpRequest<UpdateProfileRequest>({
    method: "put",
    url: import.meta.env.VITE_ENDPOINT_CONTACT_GET,
    data: model,
    alert: true,
  });
};

export default updateInfo;
