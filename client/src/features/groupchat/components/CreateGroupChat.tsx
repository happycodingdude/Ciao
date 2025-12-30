import { UsergroupAddOutlined } from "@ant-design/icons";
import { lazy, Suspense, useState } from "react";
import BackgroundPortal from "../../../components/BackgroundPortal";
import ModalLoading from "../../../components/ModalLoading";
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
        className="laptop:w-150 phone:w-100 desktop:w-[35%]"
        title="Create group"
        onClose={() => setOpen(false)}
      >
        <div className="text-(--text-main-color) phone:h-100 laptop:h-120 laptop-lg:h-150 desktop:h-200 flex flex-col gap-4 p-7">
          <Suspense fallback={<ModalLoading />}>
            <CreateGroupChatModal onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      </BackgroundPortal>
    </>
  );
};

export default CreateGroupChat;
