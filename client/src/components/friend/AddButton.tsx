import { useState } from "react";
import HttpRequest from "../../lib/fetch";
import { FriendCtaButtonProps } from "../../types/base.types";
import CustomButton from "../common/CustomButton";

const AddButton = (props: FriendCtaButtonProps) => {
  const { id, onClose, title, width, compact } = props;

  const [processing, setProcessing] = useState<boolean>(false);

  const addFriend = () => {
    setProcessing(true);
    HttpRequest<undefined, string>({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_ADD.replace(
        "{contact-id}",
        id,
      ),
    })
      .then((res) => {
        onClose?.(res.data);
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  return (
    <CustomButton
      title={title ?? "Add"}
      className={compact ? "text-3xs" : "text-2xs"}
      width={width ?? 4}
      gradientWidth="110%"
      gradientHeight="120%"
      rounded="3rem"
      onClick={addFriend}
      processing={processing}
      compact={compact}
      sm
    />
  );
};

export default AddButton;
