import { CloseOutlined } from "@ant-design/icons";

type Props = {
  contactName?: string | null;
  content?: string | null;
  onClose: () => void;
};

const ReplyPreview = ({ contactName, content, onClose }: Props) => (
  <div className="flex w-full items-center justify-center py-4">
    <div className="flex w-[95%] items-center justify-between rounded-xl border-l-[.3rem] border-l-light-blue-500/50 bg-light-blue-100 px-4 py-2">
      <div className="max-w-[80%]">
        <p className="truncate italic text-light-blue-500">
          Reply to {contactName}
        </p>
        <p className="truncate">{content}</p>
      </div>
      <CloseOutlined
        className="flex cursor-pointer items-start"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
    </div>
  </div>
);

export default ReplyPreview;
