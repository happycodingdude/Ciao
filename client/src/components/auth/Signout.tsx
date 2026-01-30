import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { signout } from "../../services/auth.service";
import { stopSignalConnection } from "../../utils/signalManager";

const Signout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return (
    <div className="mt-auto w-[60%]">
      <div
        onClick={async () => {
          await stopSignalConnection();
          signout(queryClient, router);
        }}
        className={`fa-solid fa-sign-out sidebar-item`}
      ></div>
    </div>
  );
};

export default Signout;
