import { useState } from "react";
import HttpRequest from "../../lib/fetch";
import { FriendCtaButtonProps } from "../../types/base.types";
import CustomButton from "../common/CustomButton";

const CancelButton = (props: FriendCtaButtonProps) => {
  const { id, onClose, compact } = props;

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
        onClose?.();
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  return (
    <CustomButton
      title="Cancel"
      className={compact ? "text-3xs" : "text-2xs"}
      width={compact ? 3.5 : 4}
      gradientWidth="110%"
      gradientHeight="120%"
      rounded="3rem"
      onClick={cancelFriendRequest}
      processing={processing}
      compact={compact}
      sm
    />
  );
};

export default CancelButton;
