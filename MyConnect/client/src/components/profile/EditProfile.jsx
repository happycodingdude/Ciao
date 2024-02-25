import React, { useState } from "react";
import CustomButton from "../common/CustomButton";

const EditProfile = ({ profile, onChange, onSave }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex w-[50%] flex-col items-center justify-evenly gap-[3rem] transition-all duration-500">
      <div className="flex w-full flex-col gap-[2rem]">
        <div className="flex flex-col gap-[1rem]">
          <p className="font-medium">Name</p>
          <input
            value={profile?.Name}
            className="rounded-3xl border-t-[.1rem] border-[var(--main-color-light)] px-4 py-2 shadow-[0px_2px_3px_var(--main-color-normal)] 
            outline-none transition-all duration-200"
            type="text"
            onChange={(e) => {
              onChange({ ...profile, Name: e.target.value });
            }}
          />
        </div>
        <div className="flex flex-col gap-[1rem]">
          <p className="font-medium">Password</p>
          <div className="relative">
            <input
              value={profile?.Password}
              className="w-full rounded-3xl border-t-[.1rem] border-[var(--main-color-light)] px-4 py-2 shadow-[0px_2px_3px_var(--main-color-normal)] 
              outline-none transition-all duration-200"
              type={showPassword ? "text" : "password"}
              onChange={(e) => {
                onChange({
                  ...profile,
                  Password: e.target.value,
                });
              }}
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className={`fa absolute bottom-0 right-[5%] top-0 m-auto flex h-1/2 w-[2rem] cursor-pointer items-center justify-center 
              hover:text-[var(--main-color-bold)] ${showPassword ? "fa-eye text-[var(--main-color)]" : "fa-eye-slash text-[var(--main-color)]"}`}
            ></div>
          </div>
        </div>
      </div>
      <CustomButton
        title="Save changes"
        className="h-[10%] !w-[60%]"
        onClick={onSave}
      />
    </div>
  );
};

export default EditProfile;
