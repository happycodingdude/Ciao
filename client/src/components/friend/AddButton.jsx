import React, { useState } from "react";
import { HttpRequest } from "../../common/Utility";
import CustomButton from "../common/CustomButton";

const AddButton = (props) => {
  const { id, onClose, className } = props;

  const [processing, setProcessing] = useState(false);

  const addFriend = () => {
    setProcessing(true);
    HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_ADD.replace(
        "{contact-id}",
        id,
      ),
    }).then((res) => {
      onClose(res.data);
    });
  };

  return (
    <CustomButton
      title="Add"
      className={`!mr-0 !p-[.2rem] laptop:!w-[6rem] laptop:text-xs desktop:text-md`}
      padding="py-[.3rem]"
      gradientWidth="110%"
      gradientHeight="125%"
      rounded="3rem"
      onClick={addFriend}
      processing={processing}
    />
  );
};

export default AddButton;
