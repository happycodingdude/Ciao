import { useState } from "react";
import CustomButton from "../../../components/CustomButton";

const EditProfile = (props) => {
  const { profile, onChange, onSave } = props;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex w-[50%] flex-col items-center justify-between gap-12 transition-all duration-500">
      <div className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-4">
          <p className="font-medium">Name</p>
          <input
            value={profile?.Name}
            className="outline-hidden rounded-3xl border-t-[.1rem] border-(--main-color-light) px-4 py-2 
            shadow-[0px_2px_3px_var(--main-color-normal)] transition-all duration-200"
            type="text"
            onChange={(e) => {
              onChange({ ...profile, Name: e.target.value });
            }}
          />
        </div>
        <div className="flex flex-col gap-4">
          <p className="font-medium">Password</p>
          <div className="relative">
            <input
              value={profile?.Password}
              className="outline-hidden w-full rounded-3xl border-t-[.1rem] border-(--main-color-light) px-4 py-2 
              shadow-[0px_2px_3px_var(--main-color-normal)] transition-all duration-200"
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
              className={`fa absolute bottom-0 right-[5%] top-0 m-auto flex h-1/2 w-8 cursor-pointer items-center justify-center 
              hover:text-(--main-color-bold) ${showPassword ? "fa-eye text-(--main-color)" : "fa-eye-slash text-(--main-color)"}`}
            ></div>
          </div>
        </div>
      </div>
      <CustomButton
        title="Save changes"
        className="h-[10%] w-[60%]!"
        onClick={onSave}
      />
    </div>
  );
};

export default EditProfile;
