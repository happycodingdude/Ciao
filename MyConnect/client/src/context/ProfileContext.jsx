import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { createContext, useCallback, useState } from "react";
import { HttpRequest } from "../common/Utility";
import { useAuth } from "../hook/CustomHooks";

const ProfileContext = createContext({});

export const ProfileProvider = ({ children }) => {
  console.log("ProfileProvider rendering");

  const auth = useAuth();
  const [profile, setProfile] = useState();
  const [file, setFile] = useState();

  const getProfiles = useCallback(() => {
    HttpRequest({
      method: "get",
      url: "api/auth/authenticate",
      token: auth.token,
      header: { Data: "full" },
    }).then((res) => {
      setProfile(res);
    });
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

  const updateProfile = async (onClose) => {
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
    const body = [
      {
        op: "replace",
        path: "Avatar",
        value: url,
      },
      {
        op: "replace",
        path: "Name",
        value: profile.Name,
      },
      {
        op: "replace",
        path: "Password",
        value: profile.Password,
      },
    ];
    HttpRequest({
      method: "patch",
      url: `api/contacts/${profile.Id}`,
      token: auth.token,
      data: body,
    }).then((res) => {
      auth.setUser(res);
      onClose();
    });
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        reFetch: getProfiles,
        chooseAvatar,
        updateProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;
