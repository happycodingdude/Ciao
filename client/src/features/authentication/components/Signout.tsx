import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { stopSignalConnection } from "../../../utils/signalManager";
import signout from "../services/signout";

const Signout = ({ className }: { className: string }) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // const { stopConnection } = useSignal();
  return (
    <div className="w-[60%] mt-autos">
      <div
        onClick={async () => {
          // await stopConnection();
          await stopSignalConnection();
          signout(queryClient, router);
        }}
        className={`fa-solid fa-sign-out sidebar-item`}
      ></div>
    </div>
    // <LogoutOutlined
    //   onClick={async () => {
    //     // await stopConnection();
    //     await stopSignalConnection();
    //     signout(queryClient, router);
    //   }}
    //   style={{ fontSize: "1.25rem"}}
    //   className={`${className} text-red-500`}
    // />
  );
};

export default Signout;
