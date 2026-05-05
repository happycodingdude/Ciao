import { ChangeEvent, useCallback, useState } from "react";

export const useFileAttachment = () => {
  const [files, setFiles] = useState<File[]>([]);

  // Core API: append files vào state, dedupe theo `name` để tránh duplicate khi user
  // chọn / paste cùng 1 file 2 lần. Dùng chung cho cả flow icon-select và paste-image.
  const addFiles = useCallback((incoming: File[]) => {
    if (!incoming.length) return;
    setFiles((prev) => [
      ...prev,
      ...incoming.filter((f) => !prev.some((p) => p.name === f.name)),
    ]);
  }, []);

  const chooseFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    addFiles(Array.from(e.target.files));
    // Reset value để cho phép user chọn lại cùng file ngay lập tức (nếu xóa rồi chọn lại).
    e.target.value = "";
  };

  const removeFile = useCallback((fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  }, []);

  const clearFiles = useCallback(() => setFiles([]), []);

  return { files, chooseFile, addFiles, removeFile, clearFiles };
};
