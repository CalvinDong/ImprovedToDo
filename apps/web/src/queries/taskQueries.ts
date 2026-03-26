import { queryOptions } from "@tanstack/react-query";
import { getTasksList } from "../api/tasks";

export const tasksQueryOptions = (list: string) =>
  queryOptions({
    queryKey: ["tasks", list],
    queryFn: () => getTasksList(list),
    staleTime: 1000 * 60,
  });