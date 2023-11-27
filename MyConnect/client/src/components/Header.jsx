import React from "react";
import useAuth from "../hook/useAuth";

const Header = () => {
  const auth = useAuth();
  return (
    <section className="sticky top-0 z-[2] flex h-[clamp(5rem,6vh,7rem)] bg-[var(--nav-bg-color)]">
      {/* Phone, Tablet */}
      <div className=" flex items-center justify-between laptop:hidden">
        <a href="#" className="fa fa-arrow-left">
          &ensp;Chat
        </a>
        <div className="text-center">
          <p className="font-bold">{auth.user}</p>
          <p className="text-blue-500">Online</p>
        </div>
        <div className="flex gap-[3rem]">
          <div className="flex items-center gap-[.3rem]">
            <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-400"></div>
            <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-400"></div>
            <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-400"></div>
          </div>
          <a
            href="#"
            className="aspect-square w-[3rem] rounded-[50%] border-[.2rem] border-gray-400"
          ></a>
        </div>
      </div>
      {/* Laptop, Desktop */}
      <div className=" flex grow items-center justify-between">
        <a href="#" className="font-bold">
          MyConnect
        </a>
        {auth.user ? (
          <div className="flex items-center gap-[5rem]">
            <div className="flex items-center gap-[1rem]">
              <a
                href="#"
                className="aspect-square w-[3rem] rounded-[50%] bg-orange-400"
              ></a>
              <div className="text-left">
                <p className="font-medium text-gray-600">{auth.user}</p>
                <p className="text-base text-blue-500">Online</p>
              </div>
            </div>
            <div
              className="fa fa-arrow-down group relative flex aspect-square w-[3rem] cursor-pointer items-center justify-center rounded-[1rem] bg-gray-300 font-normal
              text-gray-500 "
            >
              <div
                className="absolute right-0 top-[3rem] flex w-[10rem] origin-top scale-y-0 flex-col rounded-2xl bg-gray-300 p-[1rem]
              duration-[.5s] group-hover:scale-y-100"
              ></div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </section>
  );
};

export default Header;
