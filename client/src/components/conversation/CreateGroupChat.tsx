import { TeamOutlined, UsergroupAddOutlined } from "@ant-design/icons";
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
        description="Name your group and pick members"
        icon={<TeamOutlined />}
        onClose={() => setOpen(false)}
      >
        <div className="text-(--text-main-color) modal-content-h flex flex-col gap-6 px-6 pb-6 pt-2">
          <Suspense fallback={<ModalLoading />}>
            <CreateGroupChatModal onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      </BackgroundPortal>
    </>
  );
};

export default CreateGroupChat;
