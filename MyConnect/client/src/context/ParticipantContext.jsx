import React, { createContext, useCallback, useEffect, useState } from "react";
import { HttpRequest } from "../common/Utility";

const ParticipantContext = createContext({});

export const ParticipantProvider = () => {
  console.log("ParticipantProvider rendering");
  const auth = useAuth();
  const [participants, setParticipants] = useState();
  const getParticipants = useCallback((id, controller) => {
    HttpRequest({
      method: "get",
      url: `api/conversations/${id}/participants`,
      token: auth.token,
      // controller: controller,
    }).then((res) => {
      setParticipants(res);
    });
  }, []);
  useEffect(() => {
    getParticipants();
  }, [getParticipants]);

  return (
    <ParticipantContext.Provider
      value={{ participants, reFetch: getParticipants }}
    >
      {children}
    </ParticipantContext.Provider>
  );
};

export default ParticipantContext;
