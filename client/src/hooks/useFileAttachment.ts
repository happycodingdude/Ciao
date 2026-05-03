import { ChangeEvent, useCallback, useState } from "react";

export const useFileAttachment = () => {
  const [files, setFiles] = useState<File[]>([]);

  const chooseFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const chosen = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...chosen.filter((f) => !prev.some((p) => p.name === f.name))]);
    e.target.value = "";
  };

  const removeFile = useCallback((fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  }, []);

  const clearFiles = useCallback(() => setFiles([]), []);

  return { files, chooseFile, removeFile, clearFiles };
};
