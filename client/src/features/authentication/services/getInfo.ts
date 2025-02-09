import HttpRequest from "../../../lib/fetch";
import { UserProfile } from "../../../types";

const getInfo = async (): Promise<UserProfile> => {
  return (
    await HttpRequest<undefined, UserProfile>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_INFO,
    })
  ).data;
};
export default getInfo;
