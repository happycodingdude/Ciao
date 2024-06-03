import moment from "moment";
import React from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth, useFetchFriends } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";

const AcceptButton = (props) => {
  const { id, onClose, className } = props;

  const auth = useAuth();
  const { reFetchFriends, setProfile } = useFetchFriends();

  const acceptFriendRequest = () => {
    const body = [
      {
        op: "replace",
        path: "status",
        value: "friend",
      },
      {
        op: "replace",
        path: "acceptTime",
        value: moment().format("YYYY/MM/DD HH:mm:ss"),
      },
    ];
    HttpRequest({
      method: "patch",
      url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_GETBYID_INCLUDENOTIFY.replace(
        "{id}",
        id,
      ),
      token: auth.token,
      data: body,
    }).then((res) => {
      // reFetchRequestById(id);
      reFetchFriends();
      setProfile((current) => {
        return {
          ...current,
          friendStatus: "friend",
          friendId: res.data.id,
        };
      });
      onClose();
    });
  };

  return (
    <CustomButton
      title="Accept"
      className={`${className ?? ""}`}
      onClick={acceptFriendRequest}
    />
  );
};

export default AcceptButton;
