import React, { createContext, useCallback, useEffect, useState } from "react";
import { HttpRequest } from "../common/Utility";
import { useAuth } from "../hook/CustomHooks";

const ParticipantContext = createContext({});

export const ParticipantProvider = ({ children }) => {
  console.log("ParticipantProvider rendering");

  const auth = useAuth();
  const [participants, setParticipants] = useState();
  const [mentions, setMentions] = useState();

  const getParticipants = useCallback(
    (id) => {
      HttpRequest({
        method: "get",
        url: `api/conversations/${id}/participants`,
        token: auth.token,
      }).then((res) => {
        setParticipants(res);
      });
    },
    [auth.token],
  );

  useEffect(() => {
    const updatedMentions = participants
      ?.filter((item) => item.ContactId !== auth.id)
      .map((item) => {
        return {
          name: item.Contact.Name,
          avatar: item.Contact.Avatar,
          userId: item.Contact.Id,
        };
      });
    setMentions(updatedMentions);
  }, [participants]);

  return (
    <ParticipantContext.Provider
      value={{
        participants,
        setParticipants,
        mentions,
        reFetch: getParticipants,
      }}
    >
      {children}
    </ParticipantContext.Provider>
  );
};

export default ParticipantContext;
