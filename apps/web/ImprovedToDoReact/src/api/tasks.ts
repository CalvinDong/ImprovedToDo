import type { TaskDto } from "../../../../../packages/contracts/src/task";
import { apiFetch } from "./apiFetch";
//import type { TaskDto } from "@todo/contracts";

export async function getTasksList(list : string) : Promise<TaskDto[]>{
    const response = await apiFetch(`/${list}`);
    if (!response.body){
        throw new Error("Failed to get tasks")
    };

    return await response.json();
}


