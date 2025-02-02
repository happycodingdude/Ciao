import HttpRequest from "../../../lib/fetch";

const reopenMember = async (id) => {
  return (
    await HttpRequest({
      method: "put",
      url: import.meta.env.VITE_ENDPOINT_MEMBER_REOPEN.replace("{id}", id),
    })
  ).data;
};

export default reopenMember;
