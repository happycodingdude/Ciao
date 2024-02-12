import { CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import useAuth from "../../hook/useAuth";
import EditProfile from "./EditProfile";
import ProfileSetting from "./ProfileSetting";

const Profile = ({ onclose }) => {
  const auth = useAuth();
  const [profile, setProfile] = useState();
  const [file, setFile] = useState();

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
      Data: "full",
    };
    axios
      .get("api/auth/authenticate", {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        setProfile(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      cancelToken.cancel();
    };
  }, [auth.token]);

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
      ...profile,
      Avatar: url,
    };
    axios
      .put(`api/contacts`, body, {
        cancelToken: cancelToken.token,
        headers: headers,
      })
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
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
    <div
      className="flex h-full w-full flex-wrap
      bg-white font-sans text-base 
      transition-all duration-500             
      [&>*:not(:first-child)]:px-16 [&>*]:p-8"
    >
      <div className="bg-gradient-radial-to-bc inline-flex h-[5rem] w-full items-center justify-between from-white to-pink-300 text-white">
        <p className="text-base font-medium leading-10 ">Edit Profile</p>
        <CloseOutlined
          className="flex cursor-pointer items-start text-base"
          onClick={onclose}
        />
      </div>
      <ProfileSetting profile={profile} onchange={chooseAvatar} />
      <EditProfile
        profile={profile}
        onChange={setProfile}
        onSave={updateProfile}
      />
    </div>
  );
};

export default Profile;
