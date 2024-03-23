import React, { createContext, useCallback, useState } from "react";
import { HttpRequest } from "../common/Utility";
import { useAuth } from "../hook/CustomHooks";

const AttachmentContext = createContext({});

export const AttachmentProvider = ({ children }) => {
  console.log("AttachmentProvider rendering");

  const auth = useAuth();
  const [attachments, setAttachments] = useState();
  const [displayAttachments, setDisplayAttachments] = useState();

  const getAttachments = useCallback(
    (id) => {
      HttpRequest({
        method: "get",
        url: `api/conversations/${id}/attachments`,
        token: auth.token,
      }).then((res) => {
        setAttachments(res);
        const mergedArr = res.reduce((result, item) => {
          return result.concat(item.Attachments);
        }, []);
        setDisplayAttachments(mergedArr.slice(0, 8));
      });
    },
    [auth.token],
  );

  return (
    <AttachmentContext.Provider
      value={{ attachments, displayAttachments, reFetch: getAttachments }}
    >
      {children}
    </AttachmentContext.Provider>
  );
};

export default AttachmentContext;
