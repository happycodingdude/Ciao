import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

// Khung chung cho mỗi section: tiêu đề + mô tả + nội dung.
const SettingsCard = ({ title, description, children }: Props) => {
  return (
    <div className="border-(--border-color) bg-(--bg-color-extrathin)/50 flex flex-col gap-1 rounded-2xl border p-4">
      <h2 className="text-(--text-main-color) text-lg font-semibold">{title}</h2>
      {description && (
        <p className="text-(--text-main-color-blur) mb-2 text-sm">{description}</p>
      )}
      {children}
    </div>
  );
};

export default SettingsCard;
