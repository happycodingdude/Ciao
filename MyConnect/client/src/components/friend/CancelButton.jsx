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
      url: `api/friends/${id}`,
      token: auth.token,
    }).then((res) => {
      onClose();
    });
  };

  return (
    <CustomButton
      title="Cancel request"
      className={className}
      onClick={cancelFriendRequest}
    />
  );
};

export default CancelButton;
