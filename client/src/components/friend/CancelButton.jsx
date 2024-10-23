import React, { useState } from "react";
import { HttpRequest } from "../../common/Utility";
import CustomButton from "../common/CustomButton";

const CancelButton = (props) => {
  const { id, onClose, className } = props;

  const [processing, setProcessing] = useState(false);

  const cancelFriendRequest = () => {
    setProcessing(true);
    HttpRequest({
      method: "delete",
      url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_GETBYID.replace(
        "{id}",
        id,
      ),
    }).then((res) => {
      onClose();
    });
  };

  return (
    <CustomButton
      title="Cancel"
      className={`${className} laptop:!w-[6rem]`}
      onClick={cancelFriendRequest}
      processing={processing}
    />
  );
};

export default CancelButton;
