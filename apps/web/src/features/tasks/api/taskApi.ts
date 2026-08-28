import { deleteRequest, sendJson } from "../../../shared/apiHelper";
import type {
  CreateTaskRequest,
  SetTaskCompletedRequest,
  TaskDto,
  UpdateTaskRequest,
} from "@todo/contracts";

export function createTask(
  list: string,
  data: CreateTaskRequest
): Promise<TaskDto> {
  return sendJson<CreateTaskRequest, TaskDto>(list, "POST", data);
}

export function updateTask(
  list: string,
  taskId: string,
  data: UpdateTaskRequest
): Promise<TaskDto> {
  return sendJson<UpdateTaskRequest, TaskDto>(
    `${list}/${taskId}`,
    "PATCH",
    data
  );
}

export function setCompleteTask(
  list: string,
  taskId: string,
  data: SetTaskCompletedRequest
): Promise<TaskDto> {
  return sendJson<SetTaskCompletedRequest, TaskDto>(
    `${list}/${taskId}/complete`,
    "PATCH",
    data
  );
}

export function deleteTask(list: string, taskId: string): Promise<void> {
  return deleteRequest(`${list}/${taskId}`);
}
