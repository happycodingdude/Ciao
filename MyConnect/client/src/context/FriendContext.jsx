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
    () => {
      HttpRequest({
        method: "get",
        url: import.meta.env.VITE_ENDPOINT_FRIEND_GETALLBYCONTACTID.replace(
          "{user-id}",
          auth.id,
        ),
        token: auth.token,
      }).then((res) => {
        setFriends(res.data);
      });
    },
    [auth.id, auth.token],
  );

  const getFriendProfile = useCallback(
    (id, controller = new AbortController()) => {
      HttpRequest({
        method: "get",
        url: import.meta.env.VITE_ENDPOINT_CONTACT_GETBYID_INCLUDEFRIEND.replace(
          "{id}",
          id,
        ),
        token: auth.token,
        controller: controller,
      }).then((res) => {
        setProfile(res.data);
      });
    },
    [auth.id, auth.token],
  );

  const getRequest = useCallback(
    (id, controller = new AbortController()) => {
      HttpRequest({
        method: "get",
        url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_GETBYTWOCONTACTID.replace(
          "{user-id}",
          auth.id,
        ).replace("{id}", id),
        token: auth.token,
        controller: controller,
      }).then((res) => {
        setRequest(res.data);
      });
    },
    [auth.id, auth.token],
  );

  const getRequestById = useCallback(
    (id) => {
      HttpRequest({
        method: "get",
        url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_GETBYID.replace(
          "{id}",
          id,
        ),
        token: auth.token,
      }).then((res) => {
        setRequest(res.data);
      });
    },
    [auth.token],
  );

  return (
    <FriendContext.Provider
      value={{
        friends,
        profile,
        setProfile,
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
