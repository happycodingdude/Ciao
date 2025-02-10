import { UsergroupAddOutlined } from "@ant-design/icons";
import React, { lazy, Suspense, useState } from "react";
import BackgroundPortal from "../../../components/BackgroundPortal";
import LocalLoading from "../../../components/LocalLoading";
const CreateGroupChatModal = lazy(() => import("./CreateGroupChatModal"));

const CreateGroupChat = () => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <UsergroupAddOutlined
        className="hover:text-[var(--main-color-bold)]"
        style={{ fontSize: "16px", transition: "all 0.2s" }}
        onClick={() => setOpen(true)}
      />
      <BackgroundPortal
        show={open}
        className="laptop:!w-[50rem] desktop:!w-[70rem]"
        title="Create group"
        onClose={() => setOpen(false)}
      >
        <div className="flex flex-col gap-[1rem] p-10 pt-12 text-[var(--text-main-color)] laptop:h-[45rem] laptop-lg:h-[55rem] desktop:h-[80rem]">
          <Suspense fallback={<LocalLoading className="left-0 top-0" />}>
            <CreateGroupChatModal onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      </BackgroundPortal>
    </>
  );
};

export default CreateGroupChat;
