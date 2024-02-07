import React from "react";
import useAuth from "../../hook/useAuth";
import ImageWithLightBox from "../common/ImageWithLightBox";

const SideBar = ({ reference }) => {
  const auth = useAuth();

  const showProfile = () => {
    console.log("showProfile calling");
  };

  const showSetting = () => {
    reference.refProfileContainer.current.setAttribute("data-state", "show");
  };

  return (
    <section className="w-[7%] shrink-0 bg-white">
      {/* Phone, Tablet */}
      <div className="flex cursor-pointer items-center justify-between laptop:hidden">
        <div className="fa fa-arrow-left">&ensp;Chat</div>
        <div className="text-center">
          <p className="font-bold">{auth.display}</p>
          <p className="text-purple-200">Online</p>
        </div>
        <div className="flex gap-[3rem]">
          <div className="flex items-center gap-[.3rem]">
            <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-400"></div>
            <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-400"></div>
            <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-400"></div>
          </div>
          <div className="aspect-square w-[3rem] cursor-pointer rounded-[50%] border-[.2rem] border-gray-400"></div>
        </div>
      </div>
      {/* Laptop, Desktop */}
      {auth.id ? (
        <div className="flex h-full flex-col items-center justify-between p-[1rem]">
          <div className="flex flex-col items-center gap-[1rem]">
            <div className="relative">
              <ImageWithLightBox
                src={auth.user?.Avatar ?? ""}
                className="aspect-square w-[4rem] cursor-pointer rounded-[50%]"
                slides={[
                  {
                    src: auth.user?.Avatar ?? "",
                  },
                ]}
                onClick={showProfile}
              ></ImageWithLightBox>
            </div>
            <p className="font-medium text-gray-600">{auth.user?.Name}</p>
          </div>
          <div
            onClick={showSetting}
            className="fa fa-cog cursor-pointer text-xl font-thin text-gray-500"
          >
            {/* <div
              className="fixed bottom-[6%] left-[4%] z-[1000] flex origin-bottom-left scale-0 flex-col rounded-r-2xl rounded-tl-2xl bg-white py-[1rem] text-base shadow-[0_0_20px_1px_#dbdbdb] duration-200
              group-hover:scale-100 [&>*]:px-[2rem] [&>*]:py-[1rem]"
            >
              <Signout />
            </div> */}
          </div>
        </div>
      ) : (
        ""
      )}
    </section>
  );
};

export default SideBar;
