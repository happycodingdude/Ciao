import { CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../hook/useAuth";
import CustomButton from "../common/CustomButton";
import ImageWithLightBox from "../common/ImageWithLightBox";
import MediaPicker from "../common/MediaPicker";

const EditProfile1 = ({ refEditProfile, profile, onclose, onBack }) => {
  const auth = useAuth();
  const [editedProfile, setEditedProfile] = useState(profile);
  const [file, setFile] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const reset = () => {
    setEditedProfile(profile);
    setFile(undefined);
    setShowPassword(false);
  };

  useEffect(() => {
    reset();
    refEditProfile.reset = reset;
  }, [profile]);

  const chooseAvatar = (e) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length === 0) return;

    setEditedProfile({
      ...editedProfile,
      Avatar: URL.createObjectURL(e.target.files?.[0]),
    });
    setFile(e.target.files?.[0]);
    e.target.value = null;
  };

  const updateProfile = async () => {
    var url = "";
    if (file === undefined) {
      url = editedProfile.Avatar;
    } else {
      // Create a root reference
      const storage = getStorage();
      url = await uploadBytes(ref(storage, `avatar/${file?.name}`), file).then(
        (snapshot) => {
          return getDownloadURL(snapshot.ref).then((url) => {
            return url;
          });
        },
      );
    }

    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    const body = {
      ...editedProfile,
      Avatar: url,
    };
    axios
      .put(`api/contacts`, body, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        onBack();
        auth.setUser(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  };

  return (
    <div className="flex w-full shrink-0 flex-col items-center gap-[3rem] bg-white p-[2rem] pb-[3rem] transition-all duration-500 ">
      <div className="flex w-full items-center justify-between">
        <div
          className="fa fa-arrow-left cursor-pointer text-md font-normal"
          onClick={onBack}
        ></div>
        <p className="text-xl font-medium  leading-10 text-gray-600">
          Edit profile
        </p>
        <CloseOutlined
          className="flex cursor-pointer items-start text-lg"
          onClick={() => {
            onclose();
            onBack();
          }}
        />
      </div>
      <div className="relative ">
        <ImageWithLightBox
          src={editedProfile?.Avatar ?? ""}
          className="m-auto aspect-square w-[30%] cursor-pointer rounded-[50%]"
          slides={[
            {
              src: editedProfile?.Avatar ?? "",
            },
          ]}
        />
        <MediaPicker
          className="absolute bottom-0 left-[57%] text-lg"
          accept="image/png, image/jpeg"
          id="customer-avatar"
          onChange={chooseAvatar}
        />
      </div>
      <div className="flex w-[80%] flex-col gap-[2rem]">
        <div className="flex flex-col gap-[1rem]">
          <p className="font-medium">Name</p>
          <input
            value={editedProfile?.Name}
            className="w-full rounded-3xl border-[.1rem] border-white px-[2rem] py-[1rem] shadow-[0px_0px_20px_-3px_#dbdbdb] outline-none transition-all duration-200"
            type="text"
            onChange={(e) => {
              setEditedProfile({ ...editedProfile, Name: e.target.value });
            }}
          />
        </div>
        <div className="flex flex-col gap-[1rem]">
          <p className="font-medium">Password</p>
          <div className="relative">
            <input
              value={editedProfile?.Password}
              className="w-full rounded-3xl border-[.1rem] border-white py-[1rem] pl-[2rem] pr-[5rem] shadow-[0px_0px_20px_-3px_#dbdbdb] outline-none transition-all duration-200"
              type={showPassword ? "text" : "password"}
              onChange={(e) => {
                setEditedProfile({
                  ...editedProfile,
                  Password: e.target.value,
                });
              }}
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className={`fa absolute bottom-0 right-[5%] top-0 m-auto flex h-1/2 w-[2rem] cursor-pointer items-center justify-center hover:text-pink-600
              ${showPassword ? "fa-eye text-pink-400" : "fa-eye-slash text-pink-400"}`}
            ></div>
          </div>
        </div>
      </div>
      <CustomButton title="Save" className="!w-[60%]" onClick={updateProfile} />
    </div>
  );
};

export default EditProfile1;
