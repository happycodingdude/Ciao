import moment from "moment";
import React from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";

const AcceptButton = (props) => {
  const { request, onClose, className } = props;
  const auth = useAuth();

  const acceptFriendRequest = () => {
    request.Status = "friend";
    request.AcceptTime = moment().format("YYYY/MM/DD HH:mm:ss");
    HttpRequest({
      method: "put",
      url: `api/friends`,
      token: auth.token,
      data: request,
    }).then((res) => {
      onClose();
    });
  };

  return (
    <CustomButton
      title="Accept request"
      className={className}
      onClick={acceptFriendRequest}
    />
  );
};

export default AcceptButton;
