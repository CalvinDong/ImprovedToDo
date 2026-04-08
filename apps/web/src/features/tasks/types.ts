import type { CreateTaskRequest, TaskDto, UpdateTaskRequest } from "@todo/contracts";

export type TaskViewModel = TaskDto & {
    isOptimistic?: boolean;
    clientId?: string;
};

export type UpdateTaskMutationInput = {
  taskId: string;
  data: UpdateTaskRequest;
};

export type CreateTaskMutationInput = CreateTaskRequest & {
  clientId: string;
};

export type AppShellOutletContext = {
  selectedTaskId: string | null;
  setSelectedTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedTaskPanelKey: string | null;
  setSelectedTaskPanelKey: React.Dispatch<React.SetStateAction<string | null>>;
};