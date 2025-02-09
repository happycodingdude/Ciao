import HttpRequest from "../../../lib/fetch";

const addMembers = async (id: string, members: string[]) => {
  return (
    await HttpRequest<string[], undefined>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_MEMBER_GET.replace("{id}", id),
      data: members,
    })
  ).data;
};

export default addMembers;
