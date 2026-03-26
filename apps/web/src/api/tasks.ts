import { apiFetch } from "./apiFetch";
import type { TaskDto } from "@todo/contracts";

export async function getTasksList(list: string): Promise<TaskDto[]> {
  const response = await apiFetch(`/${list}`);

  if (!response.ok) {
    throw new Error(`Failed to get tasks: ${response.status}`);
  }

  return response.json() as Promise<TaskDto[]>;
}