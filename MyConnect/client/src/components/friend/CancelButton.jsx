import React from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth, useFetchFriends } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";

const CancelButton = (props) => {
  const { id, onClose, className } = props;

  const auth = useAuth();
  const { setProfile } = useFetchFriends();

  const cancelFriendRequest = () => {
    HttpRequest({
      method: "delete",
      url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_GETBYID_INCLUDENOTIFY.replace(
        "{id}",
        id,
      ),
      token: auth.token,
    }).then((res) => {
      // reFetchRequest(auth.id);
      setProfile((current) => {
        return {
          ...current,
          friendStatus: "new",
          friendId: null,
        };
      });
      onClose();
    });
  };

  return (
    <CustomButton
      title="Cancel"
      className={`${className ?? ""} fa fa-user-plus`}
      onClick={cancelFriendRequest}
    />
  );
};

export default CancelButton;
