import { queryOptions } from "@tanstack/react-query";
import { getJson } from "../../../shared/apiHelper";
import type { TaskDto } from "@todo/contracts";
import type { TaskViewModel } from "../model/taskTypes";

function toTaskViewModel(task: TaskDto): TaskViewModel {
  return {
    ...task,
    //position: order
  };
}

export const tasksQueryOptions = (list: string) =>
  queryOptions({
    queryKey: ["tasks", list],
    queryFn: async (): Promise<TaskViewModel[]> => {
      const tasks = await getJson<TaskDto[]>(list);
      return tasks.map(toTaskViewModel);
      /*const sortedTasks = [...tasks].sort((a, b) => {
        if (a.lexoRank < b.lexoRank) return -1;
        if (a.lexoRank > b.lexoRank) return 1;
        return 0;
      });*/
      /*return sortedTasks.map((item, index) => {
        let result = toTaskViewModel(item, index);
        console.log(result);
        return result;
        return toTaskViewModel(item, index);*/
      //});
    },
    staleTime: 1000 * 60,
  });
