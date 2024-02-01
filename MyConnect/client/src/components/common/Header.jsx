import axios from "axios";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import useAuth from "../../hook/useAuth";
import ImageWithLightBox from "./ImageWithLightBox";

const Header = () => {
  const auth = useAuth();
  const [avatar, setAvatar] = useState(auth.user?.Avatar);

  useEffect(() => {
    setAvatar(auth.user?.Avatar);
  }, [auth.user]);

  const updateAvatar = async (e) => {
    const file = e.target.files[0];
    // Create a root reference
    const storage = getStorage();
    const url = await uploadBytes(
      ref(storage, `avatar/${file.name}`),
      file,
    ).then((snapshot) => {
      return getDownloadURL(snapshot.ref).then((url) => {
        return url;
      });
    });

    const cancelToken = axios.CancelToken.source();
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + auth.token,
    };
    axios
      .put(
        `api/contacts/${auth.id}/avatars`,
        { Avatar: url },
        {
          cancelToken: cancelToken.token,
          headers: headers,
        },
      )
      .then((res) => {
        if (res.status !== 200) throw new Error(res.status);
        setAvatar(res.data.data.Avatar);
      })
      .catch((err) => {
        console.log(err);
      });

    e.target.value = null;

    return () => {
      cancelToken.cancel();
    };
  };

  const showProfile = () => {
    console.log("showProfile calling");
  };

  return (
    <section className="sticky top-0 z-[2] flex h-[clamp(5rem,6vh,7rem)] shrink-0 bg-white px-[1rem]">
      {/* Phone, Tablet */}
      <div className="flex cursor-pointer items-center justify-between laptop:hidden">
        <div className="fa fa-arrow-left">&ensp;Chat</div>
        <div className="text-center">
          <p className="font-bold">{auth.display}</p>
          <p className="text-purple-200">Online</p>
        </div>
        <div className="flex gap-[3rem]">
          <div className="flex items-center gap-[.3rem]">
            <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-400"></div>
            <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-400"></div>
            <div className="aspect-square w-[.5rem] rounded-[50%] bg-gray-400"></div>
          </div>
          <div className="aspect-square w-[3rem] cursor-pointer rounded-[50%] border-[.2rem] border-gray-400"></div>
        </div>
      </div>
      {/* Laptop, Desktop */}
      <div className="flex grow items-center justify-between">
        <div className="cursor-pointer font-bold">MyConnect</div>
        {auth.id ? (
          <div className="flex items-center gap-[5rem]">
            <div className="flex items-center gap-[1rem]">
              <div className="relative">
                <ImageWithLightBox
                  src={avatar ?? ""}
                  className="aspect-square w-[3rem] cursor-pointer rounded-[50%]"
                  slides={[
                    {
                      src: avatar ?? "",
                    },
                  ]}
                  onClick={showProfile}
                ></ImageWithLightBox>
                <input
                  multiple
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  id="customer-avatar"
                  onChange={updateAvatar}
                ></input>
                <label
                  for="customer-avatar"
                  className="fa fa-camera absolute bottom-[-20%] right-[-30%] aspect-square cursor-pointer rounded-[50%] bg-white p-[.2rem] text-gray-500 hover:text-purple-400"
                ></label>
              </div>
              <p className="font-medium text-gray-600">{auth.display}</p>
            </div>
            <div
              className="fa fa-arrow-down group relative flex aspect-square w-[3rem] cursor-pointer items-center justify-center rounded-[1rem] bg-gray-300 font-normal
              text-gray-500 "
            >
              <div
                className="absolute right-0 top-[120%] flex w-[15rem] origin-top scale-y-0 flex-col rounded-2xl bg-gray-200 py-[1rem] font-sans duration-[.5s]
              group-hover:scale-y-100 [&>*]:text-gray-500"
              >
                <span className="pl-[1rem] hover:bg-gray-300">
                  Update Profile
                </span>
              </div>
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
