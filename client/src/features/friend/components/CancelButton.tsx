import { useState } from "react";
import CustomButton from "../../../components/CustomButton";
import HttpRequest from "../../../lib/fetch";
import { FriendCtaButtonProps } from "../../../types";

const CancelButton = (props: FriendCtaButtonProps) => {
  const { id, onClose } = props;

  const [processing, setProcessing] = useState<boolean>(false);

  const cancelFriendRequest = () => {
    setProcessing(true);
    HttpRequest({
      method: "delete",
      url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_GETBYID.replace(
        "{id}",
        id,
      ),
    })
      .then((res) => {
        onClose();
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  return (
    <CustomButton
      title="Cancel"
      className="text-2xs"
      width={4}
      gradientWidth="110%"
      gradientHeight="120%"
      rounded="3rem"
      onClick={cancelFriendRequest}
      processing={processing}
      sm
    />
  );
};

export default CancelButton;
