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
        className="modal-size-sm"
        title="Connect friend"
        onClose={() => setOpen(false)}
      >
        <div className="modal-content-h flex flex-col p-5">
          <Suspense fallback={<ModalLoading className="left-0 top-0" />}>
            <ListFriend onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      </BackgroundPortal>
    </>
  );
};

export default AddFriend;
