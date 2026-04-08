import { queryOptions } from "@tanstack/react-query";
import { deleteRequest, getJson, sendJson } from "../../shared/apiHelper";
import type { TaskDto, CreateTaskRequest, UpdateTaskRequest , SetTaskCompletedRequest } from "@todo/contracts";
import type { TaskViewModel } from "./types";

function toTaskViewModel(task: TaskDto): TaskViewModel {
  return {
    ...task,
  };
}

export const tasksQueryOptions = (list: string) =>
  queryOptions({
    queryKey: ["tasks", list],
    queryFn: async (): Promise<TaskViewModel[]> => {
      const tasks = await getJson<TaskDto[]>(list);
      return tasks.map(toTaskViewModel);
    },
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
};

export function updateTask(
  list: string,
  taskId: string,
  data: UpdateTaskRequest
): Promise<TaskDto>{
  return sendJson<UpdateTaskRequest, TaskDto>(
    `${list}/${taskId}`,
    "PATCH",
    data
  );
};

export function setCompleteTask(
  list: string,
  taskId: string,
  data: SetTaskCompletedRequest,
): Promise<TaskDto>{
  return sendJson<SetTaskCompletedRequest, TaskDto>(
    `${list}/${taskId}/complete`,
    "PATCH",
    data,
  )
};

export function deleteTask(
  list: string, 
  taskId: string
): Promise<void>{
  return deleteRequest(`${list}/${taskId}`)
}


