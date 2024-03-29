import React from "react";
import { useFetchFriends } from "../../hook/CustomHooks";
import AcceptButton from "./AcceptButton";
import AddButton from "./AddButton";
import CancelButton from "./CancelButton";

const FriendRequestButton = (props) => {
  const { className, onClose } = props;
  const { profile, request } = useFetchFriends();

  return {
    new: <AddButton className={className} id={profile?.Id} onClose={onClose} />,
    request_received: (
      <AcceptButton className={className} id={request?.Id} onClose={onClose} />
    ),
    request_sent: (
      <CancelButton className={className} id={request?.Id} onClose={onClose} />
    ),
    friend: "",
  }[request?.Status];
};

export default FriendRequestButton;
