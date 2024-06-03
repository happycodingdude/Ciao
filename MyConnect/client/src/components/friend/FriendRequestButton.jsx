import React from "react";
import { useFetchFriends } from "../../hook/CustomHooks";
import AcceptButton from "./AcceptButton";
import AddButton from "./AddButton";
import CancelButton from "./CancelButton";

const FriendRequestButton = (props) => {
  const { className, onClose } = props;
  const { profile } = useFetchFriends();

  return {
    new: <AddButton className={className} id={profile?.id} onClose={onClose} />,
    request_received: (
      <AcceptButton
        className={className}
        id={profile?.friendId}
        onClose={onClose}
      />
    ),
    request_sent: (
      <CancelButton
        className={className}
        id={profile?.friendId}
        onClose={onClose}
      />
    ),
    friend: "",
  }[profile?.friendStatus];
};

export default FriendRequestButton;
