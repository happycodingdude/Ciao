import React, { createContext, useCallback, useState } from "react";
import { HttpRequest } from "../common/Utility";
import { useAuth } from "../hook/CustomHooks";

const FriendContext = createContext({});

export const FriendProvider = ({ children }) => {
  console.log("FriendProvider rendering");

  const auth = useAuth();
  const [friends, setFriends] = useState();
  const [profile, setProfile] = useState();
  const [request, setRequest] = useState();

  const getFriends = useCallback(
    (controller = new AbortController()) => {
      HttpRequest({
        method: "get",
        url: `api/contacts/${auth.id}/friends`,
        token: auth.token,
        controller: controller,
      }).then((res) => {
        setFriends(res);
      });
    },
    [auth.id, auth.token],
  );

  const getFriendProfile = useCallback(
    (id, controller = new AbortController()) => {
      HttpRequest({
        method: "get",
        url: `api/contacts/${id}`,
        token: auth.token,
        controller: controller,
      }).then((res) => {
        setProfile(res);
      });
    },
    [auth.id, auth.token],
  );

  const getRequest = useCallback(
    (id, controller = new AbortController()) => {
      HttpRequest({
        method: "get",
        url: `api/contacts/${auth.id}/friends/${id}`,
        token: auth.token,
        controller: controller,
      }).then((res) => {
        setRequest(res);
      });
    },
    [auth.id, auth.token],
  );

  const getRequestById = useCallback(
    (id) => {
      HttpRequest({
        method: "get",
        url: `api/friends/${id}`,
        token: auth.token,
      }).then((res) => {
        setRequest(res);
      });
    },
    [auth.token],
  );

  return (
    <FriendContext.Provider
      value={{
        friends,
        profile,
        request,
        reFetchFriends: getFriends,
        reFetchProfile: getFriendProfile,
        reFetchRequest: getRequest,
        reFetchRequestById: getRequestById,
      }}
    >
      {children}
    </FriendContext.Provider>
  );
};

export default FriendContext;
