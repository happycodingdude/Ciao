import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../hook/useAuth";
import EditProfile from "./EditProfile1";
import ProfileSetting from "./ProfileSetting1";

const Profile1 = ({ onclose }) => {
  const [profile, setProfile] = useState();
  const auth = useAuth();

  const refProfileWrapper = useRef();
  const refEditProfile = useRef();

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
      Data: "secret",
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

  const showEdit = () => {
    refProfileWrapper.current.setAttribute("data-state", "edit");
    refEditProfile.reset();
  };

  const showSetting = () => {
    refProfileWrapper.current.setAttribute("data-state", "setting");
  };

  return (
    <div
      ref={refProfileWrapper}
      data-state="setting"
      className="flex transition-all duration-500 data-[state=edit]:translate-x-[-100%] data-[state=setting]:translate-x-0"
    >
      <ProfileSetting profile={profile} onclose={onclose} onClick={showEdit} />
      <EditProfile
        refEditProfile={refEditProfile}
        profile={profile}
        onclose={onclose}
        onBack={showSetting}
      />
    </div>
  );
};

export default Profile1;
