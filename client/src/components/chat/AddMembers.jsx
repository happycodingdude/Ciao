import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import { useFriend } from "../../hook/CustomHooks";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";

const AddMembers = (props) => {
  const { members } = props;

  const queryClient = useQueryClient();

  const refInput = useRef();

  const { data } = useFriend();

  useEffect(() => {
    refInput.current.focus();
  }, []);

  return (
    <div className="flex flex-col p-10 pt-12 text-[90%] laptop:h-[45rem] desktop:h-[80rem]">
      <CustomInput
        type="text"
        label="Search for name"
        reference={refInput}
        onChange={(e) => {
          // findContact(e.target.value);
        }}
      />
      <div className="list-friend-container hide-scrollbar mt-4 flex grow flex-col gap-[1rem] overflow-y-scroll scroll-smooth text-[var(--text-main-color)]">
        {data?.map((item) => (
          <div
            key={item}
            className={`information-members flex w-full items-center gap-[1rem] rounded-[.5rem] p-2 
              ${
                members.some((mem) => mem.contact.id === item.contact.id)
                  ? "pointer-events-none"
                  : "cursor-pointer hover:bg-[var(--bg-color-extrathin)]"
              } `}
          >
            <input
              type="checkbox"
              checked={members.some(
                (mem) => mem.contact.id === item.contact.id,
              )}
              onChange={() => {
                // queryClient.setQueryData(["conversation"], (oldData) => {
                //   return {
                //     ...oldData,
                //     selected: {
                //       ...oldData.selected,
                //       participants: [
                //         ...oldData.selected.participants,
                //         {
                //           contact: {
                //             id: item.contact.id,
                //           },
                //         },
                //       ],
                //     },
                //   };
                // });
              }}
            ></input>
            <ImageWithLightBoxAndNoLazy
              src={item.contact.avatar}
              className="aspect-square cursor-pointer rounded-[50%] laptop:w-[3rem]"
              slides={[
                {
                  src: item.contact.avatar,
                },
              ]}
              onClick={(e) => {}}
            />
            <div>
              <CustomLabel title={item.contact.name} />
              {members.some((mem) => mem.contact.id === item.contact.id) ? (
                <p className="text-[var(--text-main-color-blur)]">Joined</p>
              ) : (
                ""
              )}
            </div>
          </div>
        ))}
      </div>
      <CustomButton
        className={`!mr-0 mt-4 !p-[.2rem] laptop:!w-[6rem] laptop:text-xs desktop:text-md`}
        leadingClass="leading-[2.5rem]"
        gradientClass="after:h-[115%] after:w-[107%]"
        title="Save"
        // onClick={updateTitle}
      />
    </div>
  );
};

export default AddMembers;
