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
        // className="base-icon-sm transition-all duration-200 hover:text-[var(--main-color-bold)]"
        className="base-icon-sm transition-all duration-200"
        onClick={() => setOpen(true)}
      />
      <BackgroundPortal
        show={open}
        className="phone:w-[35rem] laptop:w-[50rem] desktop:w-[70rem]"
        title="Add members"
        onClose={() => setOpen(false)}
      >
        <div className="flex flex-col gap-[1rem] p-10 pt-12 text-[var(--text-main-color)] phone:h-[50rem] laptop:h-[45rem] laptop-lg:h-[55rem] desktop:h-[80rem]">
          <Suspense fallback={<ModalLoading />}>
            <AddMembersModal onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      </BackgroundPortal>
    </>
  );
});

export default AddMembers;
