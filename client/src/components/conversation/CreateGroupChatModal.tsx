import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import useFriend from "../../hooks/useFriend";
import useInfo from "../../hooks/useInfo";
import { createGroupChat } from "../../services/conv.service";
import { OnCloseType } from "../../types/base.types";
import {
  ConversationCache,
  ConversationModel,
  ConversationModel_Member,
  CreateGroupChatRequest,
} from "../../types/conv.types";
import { ContactModel } from "../../types/friend.types";
import blurImage from "../../utils/blurImage";
import { isPhoneScreen } from "../../utils/getScreenSize";
import { uploadFile } from "../../utils/uploadFile";
import CustomButton from "../common/CustomButton";
import CustomInput from "../common/CustomInput";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import MediaPicker from "../common/MediaPicker";
import FriendPickerList from "./FriendPickerList";

const CreateGroupChatModal = ({ onClose }: OnCloseType) => {
  const queryClient = useQueryClient();
  const { data, isLoading, isRefetching } = useFriend();
  const { data: info } = useInfo();

  const refInputSearch = useRef<HTMLInputElement & { reset?: () => void }>(undefined);
  const refInputTitle = useRef<HTMLInputElement & { reset?: () => void }>(undefined);
  const [membersToSearch, setMembersToSearch] = useState<ContactModel[]>([]);
  const [membersToAdd, setMembersToAdd] = useState<ContactModel[]>([]);
  const [avatar, setAvatar] = useState<string>();
  const [file, setFile] = useState<File>();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!data) return;
    setMembersToSearch(data.filter((fr) => fr.status === "friend").map((item) => item.contact));
    refInputTitle.current?.focus();
    blurImage(".list-friend-container");
  }, [data]);

  const chooseAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Không có file nào được chọn → bỏ qua
    if (!e.target.files?.length) return;
    setAvatar(URL.createObjectURL(e.target.files[0]));
    setFile(e.target.files[0]);
    // Reset input để có thể chọn lại cùng file
    e.target.value = "";
  };

  const toggleMember = (item: ContactModel) => {
    setMembersToAdd((prev) =>
      // Đã có trong danh sách → bỏ chọn; chưa có → thêm vào
      prev.some((m) => m.id === item.id) ? prev.filter((m) => m.id !== item.id) : [...prev, item],
    );
  };

  const removeMemberToAdd = (id: string) =>
    setMembersToAdd((prev) => prev.filter((m) => m.id !== id));

  const createGroupChatCTA = async () => {
    // Chưa chọn ai → không tạo group
    if (membersToAdd.length === 0) return;
    setProcessing(true);

    // Có chọn ảnh → upload lên server; không có → null (group không có avatar)
    const url = file ? (await uploadFile([file]))[0].mediaUrl : null;
    const tempId = Math.random().toString(36).substring(2, 7);

    queryClient.setQueryData(["conversation"], (old: ConversationCache) => {
      const newConv: ConversationModel = {
        id: tempId,
        title: refInputTitle.current?.value ?? "",
        avatar,
        isGroup: true,
        isNotifying: true,
        lastMessageTime: null,
        members: [
          { isModerator: true, contact: { id: info?.id, name: info?.name, avatar: info?.avatar, isOnline: true } },
          ...membersToAdd.map((m) => ({ contact: { id: m.id, name: m.name, avatar: m.avatar, isOnline: m.isOnline } } as ConversationModel_Member)),
        ],
      };
      return {
        ...old,
        conversations: [{ ...newConv, noLazy: true }, ...(old.conversations ?? [])],
        filterConversations: [{ ...newConv, noLazy: true }, ...(old.conversations ?? [])],
        selected: newConv,
        noLoading: true,
        reload: false,
      } as ConversationCache;
    });

    const request: CreateGroupChatRequest = {
      title: refInputTitle.current?.value ?? "",
      avatar: url ?? undefined,
      members: membersToAdd.map((m) => m.id ?? ""),
    };
    createGroupChat(request).then((res) => {
      queryClient.setQueryData(["conversation"], (old: ConversationCache) => {
        const updated = (old.conversations ?? []).map((c) =>
          // Giữ nguyên các conv khác; thay tempId bằng real id từ server
          c.id !== tempId ? c : { ...c, id: res?.data ?? "" },
        );
        return { ...old, conversations: updated, filterConversations: updated } as ConversationCache;
      });
    });

    onClose?.();
  };

  return (
    <>
      <div className="relative flex shrink-0 items-end gap-10">
        <ImageWithLightBoxAndNoLazy className="aspect-square h-20 cursor-pointer" />
        <MediaPicker
          className="absolute -top-4 left-20"
          accept="image/png, image/jpeg"
          id="new-conversation-avatar"
          onChange={chooseAvatar}
        />
        <CustomInput
          type="text"
          inputRef={refInputTitle}
          className="laptop:w-100"
          placeholder="Type group name"
        />
      </div>
      <div className="flex grow flex-col gap-4">
        <CustomInput
          type="text"
          placeholder="Search for name"
          inputRef={refInputSearch}
          onChange={(e) => {
            const q = e.target.value.toLowerCase();
            setMembersToSearch(
              // Xóa hết search → reset về toàn bộ bạn bè (chỉ status "friend")
              q === ""
                ? (data ?? []).filter((fr) => fr.status === "friend").map((item) => item.contact)
                : membersToSearch.filter((item) => (item.name ?? "").toLowerCase().includes(q)),
            );
          }}
        />
        {/* Phone → stack dọc (list trên, selected bên dưới); màn lớn → side-by-side */}
        <div
          className={`border-(--border-color) relative flex grow gap-8 border-b-[.1rem]
            ${isPhoneScreen() ? "flex-col" : "flex-row"}`}
        >
          <FriendPickerList
            isLoading={isLoading || isRefetching}
            membersToSearch={membersToSearch}
            membersToAdd={membersToAdd}
            total={data?.length ?? 0}
            onToggleMember={toggleMember}
            removeMemberToAdd={removeMemberToAdd}
          />
        </div>
      </div>
      <CustomButton
        className="text-2xs mr-0"
        width={4}
        gradientWidth={isPhoneScreen() ? "115%" : "110%"}
        gradientHeight={isPhoneScreen() ? "130%" : "120%"}
        rounded="3rem"
        title="Save"
        onClick={createGroupChatCTA}
        processing={processing}
        sm
      />
    </>
  );
};

export default CreateGroupChatModal;
