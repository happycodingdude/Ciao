import {
  CloseOutlined,
  EditOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { useRef, useState } from "react";
import { useSignal } from "../../context/SignalContext";
import useChatDetailToggles from "../../hooks/useChatDetailToggles";
import useConversation from "../../hooks/useConversation";
import useInfo from "../../hooks/useInfo";
import { Route } from "../../routes/_layout.conversations.$conversationId";
import "../../styles/information.css";
import { UserProfile } from "../../types/base.types";
import BackgroundPortal from "../common/BackgroundPortal";
import CustomLabel from "../common/CustomLabel";
import ImageWithLightBoxAndNoLazy from "../common/ImageWithLightBoxAndNoLazy";
import AddMembers, { AddMembersProps } from "./AddMembers";
import InformationAttachments from "./InformationAttachments";
import InformationMembers from "./InformationMembers";
import UpdateConversation from "./UpdateConversation";

const Information = () => {
  const { startLocalStream } = useSignal();
  const { data: conversations } = useConversation();
  const { conversationId } = Route.useParams();
  const conversation = conversations?.conversations?.find(
    (c) => c.id === conversationId,
  );

  // Information thuần lo UI info — toàn bộ lifecycle của Search (reset khi đổi conversation,
  // phím tắt Ctrl/Cmd+F, render overlay) đã được tách sang ChatboxContainer + InformationSearch.
  // Nút X = đóng panel đang active (state mutually exclusive nên 1 set null là đủ).
  const { showInformation, setActiveDetail } = useChatDetailToggles();
  const { data: info } = useInfo();

  const refInformation = useRef<HTMLDivElement>(null);
  const refAddMembers = useRef<AddMembersProps>(null);
  const [openUpdateTitle, setOpenUpdateTitle] = useState(false);

  const otherMember = (conversation?.members ?? []).find(
    (m) => m.contact?.id !== info?.id,
  );

  return (
    <div
      ref={refInformation}
      className={`absolute top-0 pb-4 ${showInformation ? "z-10" : "z-0"} bg-(--bg-color) flex h-full w-full flex-col`}
    >
      <div className="border-b-(--border-color) panel-header-h bg-(--bg-color) flex items-center justify-between border-b-[.1rem] px-4">
        <p className="text-base font-medium">Chat information</p>
        <div className="flex gap-4">
          {conversation?.isGroup && (
            <div
              className="fa fa-pen-to-square base-icon-sm hover:text-light-blue-500"
              onClick={() => setOpenUpdateTitle(true)}
            />
          )}
          <BackgroundPortal
            show={openUpdateTitle}
            className="modal-size-lg"
            title="Update group"
            description="Change the group name and avatar"
            icon={<EditOutlined />}
            onClose={() => setOpenUpdateTitle(false)}
          >
            {conversation && (
              <UpdateConversation
                selected={conversation}
                onClose={() => setOpenUpdateTitle(false)}
              />
            )}
          </BackgroundPortal>
          <CloseOutlined
            className="base-icon-sm cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              // State mutually exclusive — 1 lần set null là đóng panel duy nhất đang mở.
              setActiveDetail(null);
            }}
          />
        </div>
      </div>
      <div className="*:border-b-(--border-color) hide-scrollbar flex grow flex-col overflow-y-auto *:border-b-[.1rem] *:px-4 *:py-2">
        <div className="flex flex-col items-center gap-4">
          <ImageWithLightBoxAndNoLazy
            src={
              conversation?.isGroup
                ? conversation.avatar
                : otherMember?.contact?.avatar
            }
            slides={[
              {
                src: conversation?.isGroup
                  ? (conversation.avatar ?? "")
                  : (otherMember?.contact?.avatar ?? ""),
              },
            ]}
            className="relative aspect-square w-20 cursor-pointer"
            circle
          />
          <div className="laptop:text-base flex w-[70%] grow flex-col items-center justify-center gap-2">
            <CustomLabel
              className="text-center font-medium"
              title={
                conversation?.isGroup
                  ? conversation.title
                  : otherMember?.contact?.name
              }
              tooltip
            />
          </div>
          <div className="conversation-action-container">
            {conversation?.isGroup && (
              <div
                className="conversation-action"
                onClick={() => refAddMembers.current?.open()}
              >
                <AddMembers ref={refAddMembers} />
              </div>
            )}
            <div
              className="conversation-action"
              onClick={() => {
                if (otherMember?.contact) {
                  startLocalStream(otherMember.contact as UserProfile);
                }
              }}
            >
              <VideoCameraOutlined className="base-icon-sm transition-all duration-200" />
            </div>
            {conversation?.isGroup && (
              <div className="conversation-action fa fa-right-from-bracket" />
            )}
          </div>
        </div>

        {conversation?.isGroup && (
          <InformationMembers
            conversation={conversation}
            selfId={info?.id}
            panelRef={refInformation}
          />
        )}

        <InformationAttachments conversationId={conversationId} />
      </div>
    </div>
  );
};

export default Information;
