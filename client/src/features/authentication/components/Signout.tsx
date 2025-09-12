import { LogoutOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { stopSignalConnection } from "../../../utils/signalManager";
import signout from "../services/signout";

const Signout = ({ className }: { className: string }) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // const { stopConnection } = useSignal();
  return (
    // <div
    //   onClick={() => signout(queryClient, navigate)}
    //   className={`fas fa-sign-out base-icon-sm text-red-500`}
    // ></div>
    <LogoutOutlined
      onClick={async () => {
        // await stopConnection();
        await stopSignalConnection();
        signout(queryClient, router);
      }}
      className={`${className} base-icon text-red-500`}
    />
  );
};

export default Signout;
