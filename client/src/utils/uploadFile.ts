import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { AttachmentModel } from "../types/message.types";
import HttpRequest from "../lib/fetch";
import getFirebaseApp from "./firebaseConfig";

const storage = getStorage(getFirebaseApp());

interface UploadedFile {
  type: "file" | "image";
  url: string;
  name: string;
  size: number;
}

const upload = (file: File): Promise<UploadedFile> => {
  return new Promise((resolve, reject) => {
    const isFile = ["doc", "docx", "xls", "xlsx", "pdf"].includes(
      file.name.split(".")[1],
    );
    const storageRef = ref(
      storage,
      isFile ? `files/${file.name}` : `images/${file.name}`,
    );
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      () => {},
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          type: isFile ? "file" : "image",
          url: downloadURL,
          size: file.size,
          name: file.name,
        });
      },
    );
  });
};

export async function uploadMultipleFile(files: File[]) {
  try {
    const uploadPromises = files.map((file) => upload(file));
    return await Promise.all(uploadPromises);
  } catch {
    return undefined;
  }
}

export async function uploadFile(files: File[]): Promise<AttachmentModel[]> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return (
    (
      await HttpRequest<FormData, AttachmentModel[]>({
        method: "post",
        url: import.meta.env.VITE_ENDPOINT_ATTACHMENT_UPLOAD,
        data: formData,
      })
    ).data ?? []
  );
}
