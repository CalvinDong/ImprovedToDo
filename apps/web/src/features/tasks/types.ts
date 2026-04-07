import type { TaskDto, UpdateTaskRequest } from "@todo/contracts";

export type TaskViewModel = TaskDto & {
    isOptimistic?: boolean;
    clientId?: string;
};

export type UpdateTaskMutationInput = {
  taskId: string;
  data: UpdateTaskRequest;
};