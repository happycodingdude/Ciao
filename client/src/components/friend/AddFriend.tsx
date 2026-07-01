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
        className="modal-size-md"
        title="Connect friend"
        description="Search people and send friend requests"
        icon={<UserAddOutlined />}
        onClose={() => setOpen(false)}
      >
        <div className="text-(--text-main-color) modal-content-h flex flex-col gap-5 px-6 pb-6 pt-2">
          <Suspense fallback={<ModalLoading className="left-0 top-0" />}>
            <ListFriend onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      </BackgroundPortal>
    </>
  );
};

export default AddFriend;
