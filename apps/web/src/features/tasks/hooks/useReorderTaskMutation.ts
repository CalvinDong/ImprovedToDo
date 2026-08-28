import { arrayMove } from "@dnd-kit/helpers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTaskPosition } from "../api/taskApi";
import type { TaskViewModel } from "../model/taskTypes";

type ReorderTaskInput = {
  taskId: string;
  sourceIndex: number;
  targetIndex: number;
  lexoRank: string;
  beforeTaskId: string | null;
  afterTaskId: string | null;
};

type ReorderTaskContext = {
  previousTasks?: TaskViewModel[];
};

export function useReorderTaskMutation(list: string) {
  const queryClient = useQueryClient();
  const queryKey = ["tasks", list];

  return useMutation<
    TaskViewModel,
    Error,
    ReorderTaskInput,
    ReorderTaskContext
  >({
    mutationFn: ({ taskId, beforeTaskId, afterTaskId }) =>
      updateTaskPosition(list, taskId, { beforeTaskId, afterTaskId }),

    onMutate: async ({ taskId, sourceIndex, targetIndex, lexoRank }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousTasks =
        queryClient.getQueryData<TaskViewModel[]>(queryKey);

      queryClient.setQueryData<TaskViewModel[]>(queryKey, (old = []) => {
        if (
          sourceIndex < 0 ||
          sourceIndex >= old.length ||
          targetIndex < 0 ||
          targetIndex >= old.length
        ) {
          return old;
        }

        return arrayMove(old, sourceIndex, targetIndex).map((task) =>
          task.id === taskId
            ? { ...task, lexoRank, isOptimistic: true }
            : task
        );
      });

      return { previousTasks };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
    },

    onSuccess: (updatedTask, variables) => {
      queryClient.setQueryData<TaskViewModel[]>(queryKey, (old = []) =>
        old.map((task) =>
          task.id === variables.taskId ? updatedTask : task
        )
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
