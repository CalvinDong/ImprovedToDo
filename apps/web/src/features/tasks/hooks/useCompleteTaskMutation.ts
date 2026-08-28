import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setCompleteTask } from "../api/taskApi";
import type { SetTaskCompletedRequest } from "@todo/contracts";
import type { TaskViewModel } from "../model/taskTypes";

export function useCompleteTaskMutation(list: string) {
  const queryClient = useQueryClient();
  const queryKey = ["tasks", list];

  return useMutation({
    mutationFn: ({
      id,
      completed,
    }: {
      id: string;
      completed: SetTaskCompletedRequest;
    }) => setCompleteTask(list, id, completed),

    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousTasks = queryClient.getQueryData<TaskViewModel[]>(queryKey);

      queryClient.setQueryData<TaskViewModel[]>(queryKey, (old = []) =>
        old.map((task) =>
          task.id === id
            ? { ...task, completed: completed.completed }
            : task
        )
      );

      return { previousTasks };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
    },

    onSuccess: (updatedTask) => {
      queryClient.setQueryData<TaskViewModel[]>(queryKey, (old = []) =>
        old.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
