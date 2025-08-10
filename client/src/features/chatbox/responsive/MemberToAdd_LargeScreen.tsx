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
        "gradient-item relative h-[95%] w-[40%] translate-x-0 self-center rounded-[.5rem] bg-[var(--bg-color)] opacity-100 transition-all duration-300",
        membersToAdd.length === 0 && "w-0 translate-x-full opacity-0",
      )}
    >
      <div className="flex h-full w-full flex-col gap-[1rem] rounded-[.5rem] bg-[var(--bg-color)] p-2">
        <p>
          Selected{" "}
          <span className="text-pink-500">
            {membersToAdd.length ?? 0}/{total}
          </span>
        </p>
        <div className="hide-scrollbar flex flex-col gap-[.5rem] overflow-y-scroll scroll-smooth text-xs">
          {membersToAdd?.map((item) => (
            <div className="flex items-center justify-between rounded-[1rem] bg-[var(--bg-color-extrathin)] p-2 !pr-4">
              <div className="pointer-events-none inline-flex items-center gap-[.5rem]">
                <ImageWithLightBoxAndNoLazy
                  src={item.avatar}
                  className="loaded aspect-square cursor-pointer laptop:w-[3rem]"
                  circle
                  slides={[
                    {
                      src: item.avatar,
                    },
                  ]}
                  onClick={() => {}}
                />
                <div>
                  <CustomLabel title={item.name} />
                </div>
              </div>
              <div
                className="fa fa-trash cursor-pointer text-base text-[var(--danger-text-color)]"
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
