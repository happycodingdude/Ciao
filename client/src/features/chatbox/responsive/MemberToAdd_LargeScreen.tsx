import { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";
import CustomLabel from "../../../components/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../../../components/ImageWithLightBoxAndNoLazy";
import { ContactModel } from "../../friend/types";

const MemberToAdd_LargeScreen = ({
  membersToAdd,
  total,
  removeMemberToAdd,
}: {
  membersToAdd: ContactModel[];
  total: number;
  removeMemberToAdd: (id: string) => void;
}) => {
  return (
    <div
      style={
        {
          "--width": `102%`,
          "--height": `101.5%`,
          "--rounded": ".5rem",
        } as CSSProperties
      }
      className={twMerge(
        "gradient-item bg-(--bg-color) relative h-[95%] w-[40%] translate-x-0 self-center rounded-lg opacity-100 transition-all duration-300",
        membersToAdd.length === 0 && "w-0 translate-x-full opacity-0",
      )}
    >
      <div className="bg-(--bg-color) flex h-full w-full flex-col gap-4 rounded-lg p-2">
        <p>
          Selected{" "}
          <span className="text-pink-500">
            {membersToAdd.length ?? 0}/{total}
          </span>
        </p>
        <div className="hide-scrollbar text-2xs flex flex-col gap-2 overflow-y-scroll scroll-smooth">
          {membersToAdd?.map((item) => (
            <div className="bg-(--bg-color-extrathin) flex items-center justify-between rounded-2xl p-2">
              <div className="pointer-events-none inline-flex w-[85%] items-center gap-2">
                <ImageWithLightBoxAndNoLazy
                  src={item.avatar}
                  className="loaded aspect-square cursor-pointer laptop:w-8"
                  circle
                  slides={[
                    {
                      src: item.avatar,
                    },
                  ]}
                  onClick={() => {}}
                />

                <CustomLabel title={item.name} />
              </div>
              <div
                className="fa fa-trash text-(--danger-text-color) cursor-pointer text-base"
                onClick={() => {
                  removeMemberToAdd(item.id);
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberToAdd_LargeScreen;
