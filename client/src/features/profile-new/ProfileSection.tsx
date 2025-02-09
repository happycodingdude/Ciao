import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useRef, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import CustomButton from "../../components/CustomButton";
import ImageWithLightBoxWithShadowAndNoLazy from "../../components/ImageWithLightBoxWithShadowAndNoLazy";
import MediaPicker from "../../components/MediaPicker";
import { UpdateProfileRequest } from "../../types";
import blurImage from "../../utils/blurImage";
import useInfo from "../authentication/hooks/useInfo";
import updateInfo from "../authentication/services/updateInfo";

const ProfileSection = () => {
  // console.log("ProfileSection calling");

  const queryClient = useQueryClient();
  const { data: info } = useInfo();

  const refName = useRef<HTMLInputElement>();
  const refBio = useRef<HTMLTextAreaElement>();

  const [file, setFile] = useState<File>();
  const [avatar, setAvatar] = useState<string>(info.avatar);
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    refName.current.value = info.name;
    refBio.current.value = info.bio;
    blurImage(".user-avatar");
  }, [info.id]);

  const chooseAvatar = (e) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length === 0) return;

    setAvatar(URL.createObjectURL(e.target.files?.[0]));
    setFile(e.target.files?.[0]);
    e.target.value = null;

    blurImage(".user-avatar");
  };

  const { mutate: updateInfoMutation } = useMutation({
    mutationFn: (req: UpdateProfileRequest) => updateInfo(req),
    onSuccess: (res, variables) => {
      setProcessing(false);
      queryClient.setQueryData(["info"], (oldData) => {
        return {
          ...(oldData as object),
          name: variables.name,
          bio: variables.bio,
          avatar: variables.avatar,
        };
      });
    },
  });

  const updateInfoCTA = async () => {
    setProcessing(true);

    let url = "";
    if (file === undefined) {
      url = avatar;
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
    updateInfoMutation({
      name: refName.current.value,
      bio: refBio.current.value,
      avatar: url,
    });
  };

  return (
    <div className="flex flex-col gap-[5rem] px-[5rem] py-[2rem]">
      <p className="text-2xl font-[600]">Edit profile</p>
      <div className="flex flex-col gap-[1rem] laptop:w-[30rem]">
        <div className="user-avatar relative flex w-full">
          <ImageWithLightBoxWithShadowAndNoLazy
            src={avatar ?? ""}
            className="aspect-square cursor-pointer rounded-[50%] bg-[size:160%] laptop:w-[40%]"
            slides={[
              {
                src: avatar ?? "",
              },
            ]}
          />
          <MediaPicker
            className="absolute left-[2%] top-[-10%] text-xl"
            accept="image/png, image/jpeg"
            id="customer-avatar"
            onChange={chooseAvatar}
          />
        </div>
        <div className="flex flex-col gap-[.5rem]">
          <p className="font-[600]">Name</p>
          <input
            ref={refName}
            className="rounded-lg bg-[var(--bg-color-extrathin)] px-4 py-2 font-medium outline-none"
            type="text"
          />
        </div>
        <div className="flex flex-col gap-[.5rem]">
          <p className="font-[600]">Bio</p>
          <textarea
            ref={refBio}
            rows={4}
            className="hide-scrollbar resize-none rounded-lg bg-[var(--bg-color-extrathin)] px-4 py-2 font-medium outline-none"
            typeof="text"
          />
        </div>
      </div>
      <CustomButton
        padding="py-[.5rem]"
        gradientWidth="110%"
        gradientHeight="125%"
        processing={processing}
        title="Save"
        className="!ml-0 !w-[30%]"
        onClick={() => {
          updateInfoCTA();
        }}
      />
    </div>
  );
};

export default ProfileSection;
