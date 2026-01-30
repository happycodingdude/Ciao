// import { Tooltip } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { lazy, Suspense, useState } from "react";
import BackgroundPortal from "../common/BackgroundPortal";
import ModalLoading from "../common/ModalLoading";
const ListFriend = lazy(() => import("./ListFriend"));

const AddFriend = () => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <UserAddOutlined className="base-icon-sm" onClick={() => setOpen(true)} />
      <BackgroundPortal
        show={open}
        className="laptop:w-100 phone:w-80 desktop:w-[35%]"
        title="Connect friend"
        onClose={() => setOpen(false)}
      >
        <div className="phone:h-100 laptop:h-120 laptop-lg:h-150 desktop:h-200 flex flex-col p-5">
          <Suspense fallback={<ModalLoading className="left-0 top-0" />}>
            <ListFriend onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      </BackgroundPortal>
    </>
  );
};

export default AddFriend;
