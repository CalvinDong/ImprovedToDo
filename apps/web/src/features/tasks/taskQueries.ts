import { queryOptions } from "@tanstack/react-query";
import { getJson, sendJson } from "./tasksApi";
import type { TaskDto, CreateTaskRequest } from "@todo/contracts";

export const tasksQueryOptions = (list: string) =>
  queryOptions({
    queryKey: ["tasks", list],
    queryFn: () => getJson<TaskDto[]>(list),
    staleTime: 1000 * 60,
  });

export function createTask(
  list: string,
  data: CreateTaskRequest
): Promise<TaskDto> {
  return sendJson<CreateTaskRequest, TaskDto>(
    `${list}`,
    "POST",
    data
  );
}

