import HttpRequest from "../../../lib/fetch";

const deleteMember = async (id, members) => {
  return (
    await HttpRequest({
      method: "delete",
      url: import.meta.env.VITE_ENDPOINT_MEMBER_GET.replace("{id}", id),
    })
  ).data;
};

export default deleteMember;
