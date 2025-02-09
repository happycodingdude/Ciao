// import { Tooltip } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import BackgroundPortal from "../../../components/BackgroundPortal";
import ListFriend from "./ListFriend";

const AddFriend = () => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      {/* <div
        onClick={() => setOpen(true)}
        className="fa fa-user-plus base-icon-lg"
      ></div> */}
      {/* <PersonAddAltOutlinedIcon
        sx={{ fontSize: "2rem" }}
        // sx={{ stroke: "#000000", strokeWidth: 0.1 }}
        className="cursor-pointer"
        onClick={() => setOpen(true)}
      /> */}
      <UserAddOutlined
        className="hover:text-[var(--main-color-bold)]"
        style={{ fontSize: "16px", transition: "all 0.2s" }}
        onClick={() => setOpen(true)}
      />
      <BackgroundPortal
        show={open}
        className="laptop:!w-[40rem] desktop:!w-[35%]"
        title="Connect friend"
        onClose={() => setOpen(false)}
      >
        <ListFriend onClose={() => setOpen(false)} />
      </BackgroundPortal>
    </>
  );
};

export default AddFriend;
