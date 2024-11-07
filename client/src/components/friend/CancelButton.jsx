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
      className={`!mr-0 !p-[.2rem] laptop:!w-[6rem] laptop:text-xs desktop:text-md`}
      leadingClass="leading-[2.5rem]"
      gradientWidth="107%"
      gradientHeight="115%"
      rounded="3rem"
      onClick={cancelFriendRequest}
      processing={processing}
    />
  );
};

export default CancelButton;
