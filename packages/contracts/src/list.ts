import type { TaskDto } from "./task"

export interface TaskListDto {
  id: string
  title: string
  order: number
  tasks: TaskDto[]
}