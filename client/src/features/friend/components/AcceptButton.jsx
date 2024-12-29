import React, { useState } from "react";
import { HttpRequest } from "../../common/Utility";
import CustomButton from "../common/CustomButton";

const AcceptButton = (props) => {
  const { id, onClose, className } = props;

  const [processing, setProcessing] = useState(false);

  const acceptFriendRequest = () => {
    setProcessing(true);
    HttpRequest({
      method: "put",
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
      title="Accept"
      className={`!mr-0 laptop:!w-[6rem] laptop:text-xs desktop:text-md`}
      padding="py-[.3rem]"
      gradientWidth="110%"
      gradientHeight="120%"
      rounded="3rem"
      onClick={acceptFriendRequest}
      processing={processing}
    />
  );
};

export default AcceptButton;
