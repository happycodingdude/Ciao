import moment from "moment";
import React from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth, useFetchFriends } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";

const AcceptButton = (props) => {
  const { id, onClose, className } = props;

  const auth = useAuth();
  const { reFetchFriends, reFetchRequestById } = useFetchFriends();

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
      reFetchRequestById(id);
      reFetchFriends();
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
