import moment from "moment";
import React from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth, useFetchNotifications } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";

const AcceptButton = (props) => {
  const { id, onClose, className, title } = props;
  const auth = useAuth();
  const { reFetchNotifications } = useFetchNotifications();

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
      url: `api/friends/${id}?includeNotify=true`,
      token: auth.token,
      data: body,
    }).then((res) => {
      reFetchNotifications();
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
