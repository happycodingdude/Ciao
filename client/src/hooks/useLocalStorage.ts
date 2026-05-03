import { useEffect, useState } from "react";

// Kiểm tra chuỗi có phải JSON hợp lệ không (để xử lý cả string thuần và object serialized)
const isJSON = (value: string | null) => {
  if (!value) return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

const useLocalStorage = <T>(
  key: string,
  initialValue?: T,
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);

    // Chưa có giá trị trong storage → dùng initialValue
    if (storedValue === null) return initialValue as T;

    // JSON (object/array/boolean/number) → parse; string thuần → dùng thẳng
    return isJSON(storedValue)
      ? (JSON.parse(storedValue) as T)
      : (storedValue as T);
  });

  useEffect(() => {
    if (value === undefined || value === null) {
      // Xóa key khi value bị set về null/undefined (tương đương reset)
      localStorage.removeItem(key);
    } else {
      // String thuần không cần stringify để tránh thêm dấu nháy kép thừa
      const valueToStore =
        typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, valueToStore);
    }
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;
