// import { Tooltip } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
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
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    const selected = reference.participants.find(
      (item) => item.ContactId === auth.id,
    );
    selected.IsNotifying = checked;
    axios
      .put(`api/participants`, selected, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        setIsNotifying(checked);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
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
