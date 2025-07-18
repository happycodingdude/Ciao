import moment from "moment";

export const getToday = (format?: string): string => moment().format(format);

export const formatDate = (datetime: string) =>
  new Date(datetime).toLocaleDateString("vi-VN");

export const formatTime = (datetime: string) =>
  new Date(datetime).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export const formatDisplayDate = (rawDate: string): string => {
  const date = moment(rawDate, "DD/MM/YYYY"); // hoặc "YYYY-MM-DD" nếu là ISO
  const today = moment();

  if (date.isSame(today, "day")) {
    return `Today, ${date.format("MMMM D")}`; // Today, July 18
  }

  if (date.isSame(today, "year")) {
    return date.format("MMMM D"); // July 17
  }

  return date.format("MMMM D, YYYY"); // July 17, 2024
};
