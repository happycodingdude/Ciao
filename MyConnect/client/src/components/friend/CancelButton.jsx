import React from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";

const CancelButton = (props) => {
  const { id, onClose, className } = props;
  const auth = useAuth();

  const cancelFriendRequest = () => {
    HttpRequest({
      method: "delete",
      url: `api/friends/${id}?includeNotify=true`,
      token: auth.token,
    }).then((res) => {
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
