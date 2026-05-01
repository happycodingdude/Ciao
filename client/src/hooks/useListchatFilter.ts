import { useContext } from "react";
import { ListchatFilterContext } from "../context/ListchatFilterContext";
import { ListchatFilterType } from "../types/base.types";

const useListchatFilter = (): ListchatFilterType => {
  const ctx = useContext(ListchatFilterContext);
  if (!ctx) throw new Error("useListchatFilter must be used inside ListchatFilterProvider");
  return ctx;
};
export default useListchatFilter;
