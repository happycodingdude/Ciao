import { QueryClient } from "@tanstack/react-query";
import HttpRequest from "../lib/fetch";
import { AppRouter } from "../main";
import {
  RefreshRequest,
  SigninRequest,
  SignupRequest,
  TokenModel,
  UpdateProfileRequest,
  UserProfile,
} from "../types/base.types";

export const forgotPassword = async (model: SigninRequest) => {
  return await HttpRequest<SigninRequest>({
    method: "post",
    url: import.meta.env.VITE_ENDPOINT_FORGOT,
    data: model,
  });
};

export const getInfo = async () => {
  return (
    await HttpRequest<undefined, UserProfile>({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_INFO,
    })
  ).data;
};

export const refreshToken = async (model: RefreshRequest) => {
  return (
    await HttpRequest<RefreshRequest, TokenModel>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_REFRESH,
      data: model,
    })
  ).data;
};

export const signin = async (model: SigninRequest) => {
  return (
    await HttpRequest<SigninRequest, TokenModel>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_SIGNIN,
      data: model,
    })
  ).data;
};

export const signout = (queryClient: QueryClient, router: AppRouter) => {
  HttpRequest({
    method: "get",
    url: import.meta.env.VITE_ENDPOINT_SIGNOUT,
  }).then((res) => {
    // Xóa toàn bộ cache liên quan
    const keysToRemove = [
      "conversation",
      "message",
      "attachment",
      "friend",
      "notification",
      "info",
    ];

    keysToRemove.forEach((key) => {
      queryClient.removeQueries({ queryKey: [key], exact: true });
    });

    // Ghi đè user info thành null
    queryClient.setQueryData(["info"], null);

    // Xóa localStorage
    [
      "accessToken",
      "refreshToken",
      "userId",
      "isRegistered",
      "toggleChatDetail",
    ].forEach((key) => localStorage.removeItem(key));

    setTimeout(() => {
      router.navigate({ to: "/auth" });
    }, 50);
  });
};

export const signup = async (model: SignupRequest) => {
  return await HttpRequest<SignupRequest>({
    method: "post",
    url: import.meta.env.VITE_ENDPOINT_SIGNUP,
    data: model,
  });
};

export const updateInfo = async (model: UpdateProfileRequest) => {
  return await HttpRequest<UpdateProfileRequest>({
    method: "put",
    url: import.meta.env.VITE_ENDPOINT_CONTACT_GET,
    data: model,
    alert: true,
  });
};
