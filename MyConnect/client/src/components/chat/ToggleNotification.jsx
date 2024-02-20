// import { Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";

const ToggleNotification = ({ reference }) => {
  const auth = useAuth();
  const [isNotifying, setIsNotifying] = useState(false);

  useEffect(() => {
    setIsNotifying(
      reference.participants?.find((item) => item.ContactId === auth.id)
        .IsNotifying,
    );
  }, [reference.participants]);

  const toggleNotification = (e) => {
    const checked = !isNotifying;
    const selected = reference.participants.find(
      (item) => item.ContactId === auth.id,
    );
    selected.IsNotifying = checked;

    HttpRequest({
      method: "put",
      url: `api/participants`,
      token: auth.token,
      data: selected,
    }).then((res) => {
      if (!res) return;
      setIsNotifying(checked);
    });
  };

  return (
    <div
      onClick={toggleNotification}
      className={`fa flex aspect-square w-[15%] cursor-pointer items-center justify-center rounded-[50%] text-base font-normal hover:bg-pink-200 
              ${isNotifying ? "fa-bell bg-pink-100 text-pink-500" : "fa-bell-slash bg-pink-200 text-pink-800"}`}
    ></div>
  );
};

export default ToggleNotification;
