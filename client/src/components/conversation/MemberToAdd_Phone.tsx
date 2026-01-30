import { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";
import { ContactModel } from "../../types/friend.types";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";

const MemberToAdd_Phone = ({
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
          "--width": `101.5%`,
          "--height": `105%`,
          "--rounded": ".5rem",
        } as CSSProperties
      }
      className={twMerge(
        "gradient-item relative mb-[1rem] w-full translate-y-0 self-center rounded-[.5rem] bg-[var(--bg-color)] opacity-100 transition-all duration-300",
        membersToAdd.length === 0 && "translate-y-full opacity-0",
      )}
    >
      <div className="flex h-full w-full flex-col gap-[1rem] rounded-[.5rem] bg-[var(--bg-color)] p-2">
        <p>
          Selected{" "}
          {/* <span className="bg-gradient-to-tr from-[var(--main-color)] to-[var(--main-color-extrathin)] text-[var(--text-sub-color)]"> */}
          <span className="text-[var(--main-color-light)]">
            {membersToAdd.length ?? 0}/{total}
          </span>
        </p>
        <div className="hide-scrollbar flex overflow-y-scroll scroll-smooth text-xs">
          {membersToAdd?.map((item) => (
            <div className="flex rounded-[1rem] p-2 pr-4">
              <ImageWithLightBoxAndNoLazy
                src={item.avatar}
                className="loaded aspect-square w-[4rem] cursor-pointer"
                circle
                slides={[
                  {
                    src: item.avatar,
                  },
                ]}
                onClick={() => {}}
              />
              <div
                className="fa fa-trash text-md cursor-pointer text-[var(--danger-text-color)]"
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

export default MemberToAdd_Phone;
