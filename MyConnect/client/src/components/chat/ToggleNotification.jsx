import React, { useEffect, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";

const ToggleNotification = (props) => {
  const { participants } = props;
  const auth = useAuth();
  const [isNotifying, setIsNotifying] = useState(false);

  useEffect(() => {
    setIsNotifying(
      participants?.find((item) => item.ContactId === auth.id).IsNotifying,
    );
  }, [participants]);

  const toggleNotification = (e) => {
    const checked = !isNotifying;
    const selected = participants?.find((item) => item.ContactId === auth.id);
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
      className={`fa flex aspect-square w-[15%] cursor-pointer items-center justify-center rounded-[50%] text-base font-normal       
      ${
        isNotifying
          ? "fa-bell bg-[var(--main-color-thin)] text-[var(--main-color-medium)] hover:bg-[var(--main-color-light)]"
          : "fa-bell-slash bg-[var(--main-color-light)] text-[var(--main-color-extrabold)]"
      }`}
    ></div>
  );
};

export default ToggleNotification;
