import { CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import useAuth from "../../hook/useAuth";
import CustomButton from "../common/CustomButton";
import ImageWithLightBox from "../common/ImageWithLightBox";
import MediaPicker from "../common/MediaPicker";

const EditProfile = ({ reference }) => {
  const auth = useAuth();

  const [profile, setProfile] = useState();
  const [file, setFile] = useState();

  const reset = () => {
    setProfile(auth.user);
    setFile(undefined);
  };

  useEffect(() => {
    reset();
    reference.refEditProfile.reset = reset;
  }, [auth.user]);

  const chooseAvatar = (e) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length === 0) return;

    setProfile({
      ...profile,
      Avatar: URL.createObjectURL(e.target.files?.[0]),
    });
    setFile(e.target.files?.[0]);
    e.target.value = null;
  };

  const updateProfile = async () => {
    var url = "";
    if (file === undefined) {
      url = profile.Avatar;
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
      ...profile,
      Name: profile.Name,
      Avatar: url,
    };
    axios
      .put(`api/contacts`, body, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        reference.showSetting();
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
    <div className="flex w-full shrink-0 flex-col items-center gap-[5rem] bg-white p-[2rem] pb-[3rem] transition-all duration-500 ">
      <div className="flex w-full items-center justify-between">
        <div
          className="fa fa-arrow-left cursor-pointer text-md font-normal"
          onClick={() => {
            reference.showSetting();
            // auth.setUser(auth.user);
          }}
        ></div>
        <p className="text-xl font-medium  leading-10 text-gray-600">
          Edit profile
        </p>
        <CloseOutlined
          className="flex cursor-pointer items-start text-lg"
          onClick={() => {
            reference.hideProfile();
            reference.showSetting();
          }}
        />
      </div>
      <div className="relative ">
        <ImageWithLightBox
          src={profile?.Avatar}
          className="m-auto aspect-square w-[30%] rounded-[50%]"
          onClick={() => {}}
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
            value={profile?.Name}
            className="w-full rounded-3xl border-[.1rem] border-white px-[2rem] py-[1rem] shadow-[0px_0px_20px_-3px_#dbdbdb] outline-none transition-all duration-200"
            type="text"
            onChange={(e) => {
              setProfile({ ...profile, Name: e.target.value });
            }}
          />
        </div>
        <div className="flex flex-col gap-[1rem]">
          <p className="font-medium">Password</p>
          <input
            value={profile?.Password}
            className="w-full rounded-3xl border-[.1rem] border-white px-[2rem] py-[1rem] shadow-[0px_0px_20px_-3px_#dbdbdb] outline-none transition-all duration-200"
            type="password"
            onChange={(e) => {
              setProfile({ ...profile, Password: e.target.value });
            }}
          />
        </div>
      </div>
      <CustomButton title="Save" className="!w-[60%]" onClick={updateProfile} />
    </div>
  );
};

export default EditProfile;
