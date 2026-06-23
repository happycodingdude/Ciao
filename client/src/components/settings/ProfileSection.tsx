import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import useInfo from "../../hooks/useInfo";
import { updateInfo } from "../../services/auth.service";
import { UserProfile } from "../../types/base.types";
import { uploadFile } from "../../utils/uploadFile";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import MediaPicker from "../common/MediaPicker";
import SettingsCard from "./SettingsCard";

const isBlob = (url: string) => url.startsWith("blob:");

const ProfileSection = () => {
  const { data: info } = useInfo();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  // `avatar` = giá trị HIỂN THỊ: URL hiện hữu hoặc blob preview khi vừa chọn ảnh mới.
  const [avatar, setAvatar] = useState("");
  const [file, setFile] = useState<File>();

  // Hydrate khi profile load lần đầu (theo id) — không ghi đè edit đang dở.
  useEffect(() => {
    if (!info) return;
    setName(info.name ?? "");
    setBio(info.bio ?? "");
    setAvatar(info.avatar ?? "");
    setFile(undefined);
  }, [info?.id]);

  const dirty =
    !!info &&
    (name !== (info.name ?? "") || bio !== (info.bio ?? "") || !!file);

  const chooseAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại cùng 1 file
    if (!picked) return;
    if (isBlob(avatar)) URL.revokeObjectURL(avatar); // thu hồi blob cũ
    setAvatar(URL.createObjectURL(picked));
    setFile(picked);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      // Chỉ upload khi user chọn ảnh mới; nếu không giữ nguyên avatar hiện tại.
      let url = info?.avatar ?? "";
      if (file) {
        const uploaded = await uploadFile([file]);
        url = uploaded[0]?.mediaUrl ?? url;
      }
      await updateInfo({ name, bio, avatar: url });
      return url;
    },
    onSuccess: (url) => {
      queryClient.setQueryData<UserProfile>(["info"], (old) =>
        old ? { ...old, name, bio, avatar: url } : old,
      );
      if (isBlob(avatar)) URL.revokeObjectURL(avatar);
      setAvatar(url);
      setFile(undefined);
    },
  });

  return (
    <SettingsCard
      title="Profile"
      description="Update how others see you across Ciao."
    >
      <div className="flex flex-col gap-3">
        {/* Avatar: click ẢNH → xem lớn (lightbox); click ICON máy ảnh → đổi ảnh. */}
        <div className="flex justify-center">
          <div className="relative aspect-square w-20">
            <ImageWithLightBoxAndNoLazy
              src={avatar}
              circle
              slides={avatar ? [{ src: avatar }] : []}
              index={0}
              className="h-full w-full"
            />
            <MediaPicker
              id="profile-avatar"
              accept="image/png, image/jpeg, image/webp"
              onChange={chooseAvatar}
              className="absolute -top-2 left-18"
            // className="!text-white border-(--bg-color) bg-light-blue-500 hover:bg-light-blue-400 absolute -bottom-1 -right-1 !flex aspect-square !w-7 items-center justify-center !rounded-full border-2 text-xs shadow-md"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-(--text-main-color) text-xs font-medium">
            Display name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="border-(--border-color) bg-(--bg-color) text-(--text-main-color) rounded-lg border px-3 py-2 text-sm outline-none focus:border-(--main-color)"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-(--text-main-color) text-xs font-medium">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            placeholder="Tell people a bit about yourself"
            className="border-(--border-color) bg-(--bg-color) text-(--text-main-color) resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-(--main-color)"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => mutate()}
            disabled={!dirty || !name.trim() || isPending}
            className="bg-light-blue-500 flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50"
          >
            <i
              className={`fa-solid ${isPending ? "fa-spinner animate-spin" : "fa-floppy-disk"
                } text-xs`}
            />
            Save changes
          </button>
        </div>
      </div>
    </SettingsCard>
  );
};

export default ProfileSection;
