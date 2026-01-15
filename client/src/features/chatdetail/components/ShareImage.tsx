import { useParams } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import BackgroundPortal from "../../../components/BackgroundPortal";
import ModalLoading from "../../../components/ModalLoading";
import "../../../information.css";
import useInfo from "../../authentication/hooks/useInfo";
import ForwardMessageModal from "../../chatbox/components/ForwardMessageModal";
import useConversation from "../../listchat/hooks/useConversation";
import { AttachmentModel } from "../../listchat/types";

const ShareImage = ({ media }: { media: AttachmentModel }) => {
  const { data: info } = useInfo();
  const { data: conversations } = useConversation();
  const { conversationId } = useParams({
    from: "/conversations/_layout/$conversationId",
  });
  const conversation = conversations.conversations.find(
    (c) => c.id === conversationId,
  );

  const [show, setShow] = useState<boolean>(false);

  if (!media) return null;

  return (
    <div className="absolute left-0 top-0 z-10 h-full w-full cursor-pointer rounded-2xl bg-black/20 opacity-0 hover:opacity-100 peer-hover:opacity-100">
      <div
        className="absolute right-2 top-1 flex aspect-square w-5 items-center justify-center rounded-sm bg-white"
        onClick={() => setShow(true)}
      >
        <div className="fa fa-share"></div>
      </div>
      <BackgroundPortal
        show={show}
        className="laptop:w-100 phone:w-80 desktop:w-[35%]"
        title="Forward message"
        onClose={() => setShow(false)}
      >
        <div className="phone:h-100 laptop:h-120 laptop-lg:h-150 desktop:h-200 flex flex-col p-5">
          <Suspense fallback={<ModalLoading />}>
            <ForwardMessageModal
              message={{
                type: "media",
                attachments: [media],
              }}
              forward={false}
              directContact={
                !conversation.isGroup
                  ? conversation.members?.find(
                      (item) => item.contact.id !== info.id,
                    )?.contact.id
                  : undefined
              }
            />
          </Suspense>
        </div>
      </BackgroundPortal>
    </div>
  );
};

export default ShareImage;
