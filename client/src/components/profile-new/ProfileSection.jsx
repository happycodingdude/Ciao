import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { blurImage } from "../../common/Utility";
import { useInfo } from "../../hook/CustomHooks";
import { updateInfo } from "../../hook/UserAPIs";
import CustomButton from "../common/CustomButton";
import ImageWithLightBoxWithShadowAndNoLazy from "../common/ImageWithLightBoxWithShadowAndNoLazy";
import MediaPicker from "../common/MediaPicker";

const ProfileSection = () => {
  console.log("ProfileSection calling");

  const queryClient = useQueryClient();
  const { data: info, refetch } = useInfo();

  const refName = useRef();
  const refBio = useRef();

  const [file, setFile] = useState();
  const [avatar, setAvatar] = useState(info.data.avatar);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    refName.current.value = info.data.name;
    refBio.current.value = info.data.bio;
    blurImage(".user-avatar");
  }, [info.data.id]);

  const chooseAvatar = (e) => {
    const chosenFiles = Array.from(e.target.files);
    if (chosenFiles.length === 0) return;

    setAvatar(URL.createObjectURL(e.target.files?.[0]));
    setFile(e.target.files?.[0]);
    e.target.value = null;

    blurImage(".user-avatar");
  };

  const { mutate: updateInfoMutation } = useMutation({
    mutationFn: ({ name, bio, avatar }) => updateInfo(name, bio, avatar),
    onSuccess: (res) => {
      setProcessing(false);
      queryClient.setQueryData(["info"], (oldData) =>
        oldData
          ? {
              ...oldData,
              data: {
                ...oldData.data,
                avatar: res,
              },
            }
          : oldData,
      );
      // queryClient.invalidateQueries(["info"]);
      // refetch();
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
      <p className="text-2xl font-medium text-[var(--text-main-color)]">
        Edit profile
      </p>
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
          <p className="text-[var(--text-main-color)]">Name</p>
          <input
            ref={refName}
            className="rounded-lg bg-[var(--bg-color)] px-4 py-2 font-medium outline-none"
            type="text"
          />
        </div>
        <div className="flex flex-col gap-[.5rem]">
          <p className="text-[var(--text-main-color)]">Bio</p>
          <textarea
            ref={refBio}
            rows={4}
            className="hide-scrollbar resize-none rounded-lg bg-[var(--bg-color)] px-4 py-2 font-medium outline-none"
            type="text"
          />
        </div>
      </div>
      <CustomButton
        processing={processing}
        title="Save"
        className="!ml-0 h-[10%] !w-[30%]"
        onClick={() => {
          updateInfoCTA();
        }}
      />
    </div>
  );
};

export default ProfileSection;
