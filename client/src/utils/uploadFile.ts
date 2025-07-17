import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

export default async function uploadFile(file: File): Promise<string> {
  // Create a root reference
  const storage = getStorage();
  return await uploadBytes(ref(storage, `avatar/${file?.name}`), file).then(
    (snapshot) => {
      return getDownloadURL(snapshot.ref).then((url) => {
        return url;
      });
    },
  );
}
