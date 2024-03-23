import React from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";

const AddButton = (props) => {
  const { id, onClose, className } = props;
  const auth = useAuth();

  const addFriend = () => {
    HttpRequest({
      method: "post",
      url: `api/friends`,
      token: auth.token,
      data: {
        ContactId1: auth.user.Id,
        ContactId2: id,
        Status: "request",
      },
    }).then((res) => {
      onClose();
    });
  };

  return (
    <CustomButton
      title="Add friend"
      className={className}
      onClick={addFriend}
    />
  );
};

export default AddButton;
