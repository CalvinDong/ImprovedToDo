import type { TaskDto } from "@todo/contracts";

export type TaskViewModel = TaskDto & {
    isOptimistic?: boolean;
    clientId?: string;
};