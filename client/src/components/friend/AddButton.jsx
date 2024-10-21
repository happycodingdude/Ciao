import React from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";

const AddButton = (props) => {
  const { id, onClose, className } = props;

  const auth = useAuth();
  // const { setProfile } = useFetchFriends();

  const addFriend = () => {
    HttpRequest({
      method: "post",
      url: import.meta.env.VITE_ENDPOINT_FRIEND_REQUEST_ADD.replace(
        "{contact-id}",
        id,
      ),
    }).then((res) => {
      // reFetchRequestById(res.data.id);
      // setProfile((current) => {
      //   return {
      //     ...current,
      //     friendStatus: "request_sent",
      //     friendId: res.data.id,
      //   };
      // });
      onClose(res.data);
    });
  };

  return (
    <CustomButton
      title="Add"
      className={`${className ?? ""} fa fa-user-plus`}
      onClick={addFriend}
    />
  );
};

export default AddButton;
