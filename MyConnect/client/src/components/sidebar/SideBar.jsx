import axios from "axios";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import useAuth from "../../hook/useAuth";
import ImageWithLightBox from "../common/ImageWithLightBox";
import Signout from "./Signout";

const SideBar = () => {
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
    <section className="w-[7%] shrink-0 bg-white">
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
      {/* <div className="flex grow flex-col items-center justify-between"> */}
      {/* <div className="cursor-pointer font-bold">MyConnect</div> */}
      {auth.id ? (
        <div className="flex h-full flex-col items-center justify-between p-[1rem]">
          <div className="flex flex-col items-center gap-[1rem]">
            <div className="relative">
              <ImageWithLightBox
                src={avatar ?? ""}
                className="aspect-square w-[4rem] cursor-pointer rounded-[50%]"
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
                className="fa fa-camera absolute bottom-[-10%] right-[-20%] aspect-square cursor-pointer rounded-[50%] bg-white p-[.2rem] text-gray-500 hover:text-purple-400"
              ></label>
            </div>
            <p className="font-medium text-gray-600">{auth.display}</p>
          </div>
          <div className="fa fa-cog group relative cursor-pointer text-xl font-thin text-gray-500">
            <div
              className="fixed bottom-[6%] left-[4%] z-[1000] flex origin-bottom-left scale-0 flex-col rounded-r-2xl rounded-tl-2xl bg-white py-[1rem] text-base shadow-[0_0_20px_1px_#dbdbdb] duration-200
              group-hover:scale-100 [&>*]:px-[2rem] [&>*]:py-[1rem]"
            >
              <Signout />
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </section>
  );
};

export default SideBar;
