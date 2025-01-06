import HttpRequest from "../../../lib/fetch";

const signout = (queryClient, navigate) => {
  HttpRequest({
    method: "get",
    url: import.meta.env.VITE_ENDPOINT_SIGNOUT,
  }).then((res) => {
    queryClient.removeQueries({ queryKey: ["conversation"], exact: true });
    queryClient.removeQueries({ queryKey: ["message"], exact: true });
    queryClient.removeQueries({ queryKey: ["attachment"], exact: true });
    queryClient.removeQueries({ queryKey: ["friend"], exact: true });
    queryClient.removeQueries({ queryKey: ["notification"], exact: true });
    queryClient.removeQueries({ queryKey: ["info"], exact: true });

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("isRegistered");
    localStorage.removeItem("toggleChatDetail");

    navigate("/auth");
  });
};

export default signout;
