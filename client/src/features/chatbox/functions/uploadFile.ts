import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import getFirebaseApp from "../../../utils/firebaseConfig";

const storage = getStorage(getFirebaseApp());

interface UploadedFile {
  type: "file" | "image";
  url: string;
  name: string;
  size: number;
}

// Function to upload a single file and return its download URL
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
      (snapshot) => {
        // const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // setProgress((prev) => ({ ...prev, [file.name]: progressPercent }));
      },
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
    const uploadedFiles = await Promise.all(uploadPromises);
    console.log("Uploaded Files:", uploadedFiles);
    return uploadedFiles;
  } catch (error) {
    console.error("Upload failed:", error);
  }
}

export async function uploadFile(file: File): Promise<string> {
  // Create a root reference
  const storage = getStorage(getFirebaseApp());
  return await uploadBytes(ref(storage, `avatar/${file?.name}`), file).then(
    (snapshot) => {
      return getDownloadURL(snapshot.ref).then((url) => {
        return url;
      });
    },
  );
}
