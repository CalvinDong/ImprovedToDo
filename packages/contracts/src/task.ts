export interface TagDto {
  id: string
  name: string
  color: string
}

export interface SubTaskDto {
  id: string
  title: string
  completed: boolean
  order: number
}

export interface TaskDto {
  id: string
  title: string
  description?: string | null
  completed: boolean
  listId?: string
  lexoRank: string
  tags?: TagDto[]
  connectedTaskIds?: string[]
  subtasks?: SubTaskDto[]
  createdAtUtc: string
  updatedAtUtc: string
}

export interface CreateTaskRequest {
  title: string
  description?: string | null
  listId?: string
  lexoRank: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string | null
  dueDateSet?: boolean
  dueDate?: Date
  completed?: boolean
  todoListId?: string
  lexoRank?: string
}

export interface MoveTaskRequest {
  taskId: string
  sourceListId: string
  destinationListId: string
  newOrder: number
}

export interface SetTaskCompletedRequest {
  completed: boolean
}