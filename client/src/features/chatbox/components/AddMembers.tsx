import { UsergroupAddOutlined } from "@ant-design/icons";
import {
  forwardRef,
  lazy,
  Suspense,
  useImperativeHandle,
  useState,
} from "react";
import BackgroundPortal from "../../../components/BackgroundPortal";
import ModalLoading from "../../../components/ModalLoading";
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
        className="laptop:w-150 phone:w-100 desktop:w-[35%]"
        title="Add members"
        onClose={() => setOpen(false)}
      >
        <div className="text-(--text-main-color) phone:h-100 laptop:h-120 laptop-lg:h-150 desktop:h-200 flex flex-col gap-4 p-7">
          <Suspense fallback={<ModalLoading />}>
            <AddMembersModal onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      </BackgroundPortal>
    </>
  );
});

export default AddMembers;
