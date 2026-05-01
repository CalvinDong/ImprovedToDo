import type { TaskDto } from "./task"

export interface TaskListDto {
  id: string
  title: string
  lexoRank: string
  tasks: TaskDto[]
}