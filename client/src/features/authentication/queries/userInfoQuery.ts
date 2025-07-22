import { queryOptions } from "@tanstack/react-query";
import getInfo from "../services/getInfo";

const userQueryOptions = queryOptions({
  queryKey: ["info"],
  queryFn: getInfo,
});

export default userQueryOptions;
