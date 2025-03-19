import moment from "moment";

export function getToday(format?: string): string {
  return moment().format(format);
}
