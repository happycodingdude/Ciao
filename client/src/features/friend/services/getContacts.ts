import HttpRequest from "../../../lib/fetch";
import { ContactModel } from "../types";

const getContacts = async (name: string): Promise<ContactModel[]> => {
  return (
    await HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_CONTACT_GETBYNAME.replace(
        "{name}",
        name,
      ),
    })
  ).data;
};
export default getContacts;
