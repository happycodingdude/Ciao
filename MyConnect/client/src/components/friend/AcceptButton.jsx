import moment from "moment";
import React from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";

const AcceptButton = (props) => {
  const { request, onClose, className } = props;
  const auth = useAuth();

  const acceptFriendRequest = () => {
    const body = [
      {
        op: "replace",
        path: "Status",
        value: "friend",
      },
      {
        op: "replace",
        path: "AcceptTime",
        value: moment().format("YYYY/MM/DD HH:mm:ss"),
      },
    ];
    HttpRequest({
      method: "patch",
      url: `api/friends/${request.Id}`,
      token: auth.token,
      data: body,
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
