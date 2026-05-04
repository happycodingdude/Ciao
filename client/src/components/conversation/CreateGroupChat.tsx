import { UsergroupAddOutlined } from "@ant-design/icons";
import { lazy, Suspense, useState } from "react";
import BackgroundPortal from "../common/BackgroundPortal";
import ModalLoading from "../common/ModalLoading";
const CreateGroupChatModal = lazy(() => import("./CreateGroupChatModal"));

const CreateGroupChat = () => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <UsergroupAddOutlined
        className="base-icon-sm"
        onClick={() => setOpen(true)}
      />
      <BackgroundPortal
        show={open}
        className="modal-size-lg"
        title="Create group"
        onClose={() => setOpen(false)}
      >
        <div className="text-(--text-main-color) modal-content-h flex flex-col gap-4 p-7">
          <Suspense fallback={<ModalLoading />}>
            <CreateGroupChatModal onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      </BackgroundPortal>
    </>
  );
};

export default CreateGroupChat;
