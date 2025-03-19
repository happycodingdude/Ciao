import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

const storage = getStorage();

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

export default async function uploadFile(files: File[]) {
  try {
    const uploadPromises = files.map((file) => upload(file));
    const uploadedFiles = await Promise.all(uploadPromises);
    console.log("Uploaded Files:", uploadedFiles);
    return uploadedFiles;
  } catch (error) {
    console.error("Upload failed:", error);
  }
}

// export default function uploadFile(files: File[]) {
//   // Create a root reference
//   try {
//     const storage = getStorage();
//     return Promise.all(
//       files.map((item) => {
//         if (
//           ["doc", "docx", "xls", "xlsx", "pdf"].includes(
//             item.name.split(".")[1],
//           )
//         ) {
//           return uploadBytes(ref(storage, `file/${item.name}`), item).then(
//             (snapshot) => {
//               return getDownloadURL(snapshot.ref).then((url) => {
//                 return {
//                   type: "file",
//                   url: url,
//                   name: item.name,
//                   size: item.size,
//                 };
//               });
//             },
//           );
//         }
//         return uploadBytes(ref(storage, `img/${item.name}`), item).then(
//           (snapshot) => {
//             return getDownloadURL(snapshot.ref).then((url) => {
//               return {
//                 type: "image",
//                 url: url,
//                 name: item.name,
//                 size: item.size,
//               };
//             });
//           },
//         );
//       }),
//     );
//   } catch (ex) {
//     console.log(ex);
//   }
// }
