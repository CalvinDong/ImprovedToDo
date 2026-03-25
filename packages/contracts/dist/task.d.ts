export interface TagDto {
    id: string;
    name: string;
    color: string;
}
export interface SubTaskDto {
    id: string;
    title: string;
    completed: boolean;
    order: number;
}
export interface TaskDto {
    id: string;
    title: string;
    description: string | null;
    listId: string;
    order: number;
    tags: TagDto[];
    connectedTaskIds: string[];
    subtasks: SubTaskDto[];
    createdAt: string;
    updatedAt: string;
}
export interface CreateTaskRequest {
    title: string;
    description?: string | null;
    listId: string;
}
export interface UpdateTaskRequest {
    title?: string;
    description?: string | null;
}
export interface MoveTaskRequest {
    taskId: string;
    sourceListId: string;
    destinationListId: string;
    newOrder: number;
}
//# sourceMappingURL=task.d.ts.map