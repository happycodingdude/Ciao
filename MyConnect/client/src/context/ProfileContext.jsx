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

  const getProfiles = useCallback(
    (controller = new AbortController()) => {
      HttpRequest({
        method: "get",
        url: import.meta.env.VITE_ENDPOINT_INFO,
        token: auth.token,
        header: { Data: "full" },
        controller: controller,
      }).then((res) => {
        setProfile(res.data);
      });
    },
    [auth.token],
  );

  const chooseAvatar = (e) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length === 0) return;

    setProfile({
      ...profile,
      avatar: URL.createObjectURL(e.target.files?.[0]),
    });
    setFile(e.target.files?.[0]);
    e.target.value = null;
  };

  const updateProfile = async () => {
    var url = "";
    if (file === undefined) {
      url = profile.avatar;
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
        path: "avatar",
        value: url,
      },
      {
        op: "replace",
        path: "name",
        value: profile.name,
      },
      {
        op: "replace",
        path: "bio",
        value: profile.bio,
      },
    ];
    HttpRequest({
      method: "patch",
      url: import.meta.env.VITE_ENDPOINT_CONTACT_GETBYID.replace(
        "{id}",
        profile.id,
      ),
      token: auth.token,
      data: body,
    }).then((res) => {
      auth.setUser(res.data);
      // onClose();
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
