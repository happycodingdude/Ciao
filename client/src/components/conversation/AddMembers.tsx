import { UsergroupAddOutlined } from "@ant-design/icons";
import {
  forwardRef,
  lazy,
  Suspense,
  useImperativeHandle,
  useState,
} from "react";
import BackgroundPortal from "../common/BackgroundPortal";
import ModalLoading from "../common/ModalLoading";
const AddMembersModal = lazy(() => import("./AddMembersModal"));

export type AddMembersProps = {
  open: () => void;
};

const AddMembers = forwardRef<AddMembersProps>((props, ref) => {
  const [open, setOpen] = useState<boolean>(false);
  useImperativeHandle(ref, () => ({
    open() {
      setOpen(true);
    },
  }));
  return (
    <>
      <UsergroupAddOutlined
        className="base-icon-sm transition-all duration-200"
        onClick={() => setOpen(true)}
      />
      <BackgroundPortal
        show={open}
        className="modal-size-lg"
        title="Add members"
        description="Search and select people to add to this group"
        icon={<UsergroupAddOutlined />}
        onClose={() => setOpen(false)}
      >
        <div className="text-(--text-main-color) modal-content-h flex flex-col gap-4 px-6 pb-6 pt-2">
          <Suspense fallback={<ModalLoading />}>
            <AddMembersModal onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      </BackgroundPortal>
    </>
  );
});

export default AddMembers;
