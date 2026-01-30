import { useEffect, useState } from "react";
import HttpRequest from "../../../lib/fetch";
import { useAuth, useFetchParticipants } from "../../hook/CustomHooks";

const ToggleNotification = () => {
  const auth = useAuth();
  const [isNotifying, setIsNotifying] = useState(false);
  const { participants } = useFetchParticipants();

  useEffect(() => {
    setIsNotifying(
      participants?.find((item) => item.ContactId === auth.id).IsNotifying,
    );
  }, [participants]);

  const toggleNotification = (e) => {
    const checked = !isNotifying;
    const selected = participants?.find((item) => item.ContactId === auth.id);
    const body = [
      {
        op: "replace",
        path: "IsNotifying",
        value: checked,
      },
    ];

    HttpRequest({
      method: "patch",
      url: import.meta.env.VITE_ENDPOINT_PARTICIPANT_GETBYID.replace(
        "{id}",
        selected.Id,
      ),
      token: auth.token,
      data: body,
    }).then((res) => {
      setIsNotifying(checked);
    });
  };

  return (
    <div
      onClick={toggleNotification}
      className={`fa flex aspect-square w-[13%] cursor-pointer items-center justify-center rounded-[50%] text-sm font-normal       
      ${
        isNotifying
          ? "fa-bell bg-[var(--main-color-thin)] text-[var(--main-color-medium)] hover:bg-[var(--main-color-light)]"
          : "fa-bell-slash bg-[var(--main-color-light)] text-[var(--main-color-extrabold)]"
      }`}
    ></div>
  );
};

export default ToggleNotification;
