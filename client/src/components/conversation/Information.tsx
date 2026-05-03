import { CloseOutlined, VideoCameraOutlined } from "@ant-design/icons";
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
  const conversation = conversations?.conversations?.find((c) => c.id === conversationId);

  const { toggle, setToggle } = useChatDetailToggles();
  const { data: info } = useInfo();

  const refInformation = useRef<HTMLDivElement>(null);
  const refAddMembers = useRef<AddMembersProps>(null);
  const [openUpdateTitle, setOpenUpdateTitle] = useState(false);

  const otherMember = (conversation?.members ?? []).find((m) => m.contact?.id !== info?.id);

  return (
    <div
      ref={refInformation}
      className={`absolute top-0 pb-4 ${toggle === "information" ? "z-10" : "z-0"} hide-scrollbar flex h-full w-full flex-col overflow-y-auto bg-white`}
    >
      <div className="*:border-b-(--border-color) flex grow flex-col *:border-b-[.1rem] *:px-4 *:py-2">
        <div className="laptop:h-16 flex items-center justify-between px-4">
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
              className="phone:w-140 laptop:w-140 desktop:w-[35%]"
              title="Update group"
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
              onClick={(e) => { e.stopPropagation(); setToggle(null); }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <ImageWithLightBoxAndNoLazy
            src={conversation?.isGroup ? conversation.avatar : otherMember?.contact?.avatar}
            slides={[{
              src: conversation?.isGroup
                ? conversation.avatar ?? ""
                : otherMember?.contact?.avatar ?? "",
            }]}
            className="relative aspect-square w-20 cursor-pointer"
            circle
          />
          <div className="laptop:text-base flex w-[70%] grow flex-col items-center justify-center gap-2">
            <CustomLabel
              className="text-center font-medium"
              title={conversation?.isGroup ? conversation.title : otherMember?.contact?.name}
              tooltip
            />
          </div>
          <div className="conversation-action-container">
            {conversation?.isGroup && (
              <div className="conversation-action" onClick={() => refAddMembers.current?.open()}>
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
