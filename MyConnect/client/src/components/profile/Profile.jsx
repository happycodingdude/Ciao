import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { HttpRequest } from "../../common/Utility";
import { useAuth } from "../../hook/CustomHooks";
import EditProfile from "./EditProfile";
import ProfileSetting from "./ProfileSetting";

const Profile = () => {
  const auth = useAuth();
  const [profile, setProfile] = useState();
  const [file, setFile] = useState();

  useEffect(() => {
    const controller = new AbortController();
    const config = {
      method: "get",
      url: "api/auth/authenticate",
      token: auth.token,
      header: { Data: "full" },
      controller: controller,
    };
    HttpRequest(config).then((res) => {
      if (!res) return;
      setProfile(res);
    });
    return () => {
      controller.abort();
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

    const config = {
      method: "put",
      url: "api/contacts",
      token: auth.token,
      data: {
        ...profile,
        Avatar: url,
      },
    };
    HttpRequest(config).then((res) => {
      if (!res) return;
      auth.setUser(res);
    });
  };

  return (
    <div className="flex w-full grow bg-[var(--bg-color)] text-base transition-all duration-500 [&>*]:px-16">
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
