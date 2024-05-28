// import { Tooltip } from "antd";
import React, { useState } from "react";
import { useAuth } from "../../hook/CustomHooks";
import BackgroundPortal from "../common/BackgroundPortal";
import ListFriend from "./ListFriend";

const AddFriend = () => {
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="fa fa-user-plus flex flex-1 cursor-pointer items-center justify-center rounded-lg text-sm font-normal 
        transition-all duration-200 hover:bg-[var(--search-bg-color)] "
      ></div>
      <BackgroundPortal
        open={open}
        className="laptop:!w-[40%] desktop:!w-[35%]"
        title="Add friend"
        onClose={() => setOpen(false)}
      >
        <ListFriend onclose={() => setOpen(false)} />
      </BackgroundPortal>
    </>
  );
};

export default AddFriend;
