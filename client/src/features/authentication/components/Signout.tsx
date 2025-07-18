import { LogoutOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useSignal } from "../../../context/SignalContext";
import signout from "../services/signout";

const Signout = ({ className }: { className: string }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { stopConnection } = useSignal();
  return (
    // <div
    //   onClick={() => signout(queryClient, navigate)}
    //   className={`fas fa-sign-out base-icon-sm text-red-500`}
    // ></div>
    <LogoutOutlined
      onClick={async () => {
        await stopConnection();
        signout(queryClient, navigate);
      }}
      className={`${className} base-icon text-red-500`}
    />
  );
};

export default Signout;
