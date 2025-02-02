import React, { useState } from "react";
import CustomButton from "../../../components/CustomButton";
import HttpRequest from "../../../lib/fetch";

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
      className={`!mr-0  laptop:!w-[6rem] laptop:text-xs desktop:text-md`}
      padding="py-[.3rem]"
      gradientWidth="110%"
      gradientHeight="120%"
      rounded="3rem"
      onClick={cancelFriendRequest}
      processing={processing}
    />
  );
};

export default CancelButton;
