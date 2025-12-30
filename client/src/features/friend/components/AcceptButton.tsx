import { useState } from "react";
import CustomButton from "../../../components/CustomButton";
import HttpRequest from "../../../lib/fetch";
import { FriendCtaButtonProps } from "../../../types";

const AcceptButton = (props: FriendCtaButtonProps) => {
  const { id, onClose } = props;

  const [processing, setProcessing] = useState<boolean>(false);

  const acceptFriendRequest = () => {
    setProcessing(true);
    HttpRequest({
      method: "put",
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
      title="Accept"
      className="text-2xs"
      width={4}
      padding="py-0"
      gradientWidth="110%"
      gradientHeight="120%"
      rounded="3rem"
      onClick={acceptFriendRequest}
      processing={processing}
    />
  );
};

export default AcceptButton;
