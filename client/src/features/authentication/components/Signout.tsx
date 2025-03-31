import { LogoutOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useNavigate } from "react-router-dom";
import signout from "../services/signout";

const Signout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return (
    // <div
    //   onClick={() => signout(queryClient, navigate)}
    //   className={`fas fa-sign-out base-icon-sm text-red-500`}
    // ></div>
    <LogoutOutlined
      onClick={() => signout(queryClient, navigate)}
      className="base-icon text-red-500"
    />
  );
};

export default Signout;
