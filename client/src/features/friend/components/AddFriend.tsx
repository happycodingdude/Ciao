// import { Tooltip } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import React, { lazy, Suspense, useState } from "react";
import BackgroundPortal from "../../../components/BackgroundPortal";
import LocalLoading from "../../../components/LocalLoading";
const ListFriend = lazy(() => import("./ListFriend"));

const AddFriend = () => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <UserAddOutlined
        className="hover:text-[var(--main-color-bold)]"
        style={{ fontSize: "16px", transition: "all 0.2s" }}
        onClick={() => setOpen(true)}
      />
      <BackgroundPortal
        show={open}
        className="laptop:w-[40rem] desktop:w-[35%]"
        title="Connect friend"
        onClose={() => setOpen(false)}
      >
        <div className="flex flex-col p-10 pt-12 laptop:h-[45rem] laptop-lg:h-[55rem] desktop:h-[80rem]">
          <Suspense fallback={<LocalLoading className="left-0 top-0" />}>
            <ListFriend onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      </BackgroundPortal>
    </>
  );
};

export default AddFriend;
