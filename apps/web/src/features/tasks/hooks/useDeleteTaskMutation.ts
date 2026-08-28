import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTask } from "../api/taskApi";
import type { TaskViewModel } from "../model/taskTypes";

export function useDeleteTaskMutation(list: string){
    const queryClient = useQueryClient();
    const queryKey = ["tasks", list];

    return useMutation({
        mutationFn: (taskId: string) => deleteTask(list, taskId),

        onMutate: async (taskId) => {
            await queryClient.cancelQueries({ queryKey });

            const previousTasks = queryClient.getQueryData<TaskViewModel[]>(queryKey);

            queryClient.setQueryData<TaskViewModel[]>(queryKey, (old = []) =>
                old.filter((task) => task.id !== taskId)
            );

            return { previousTasks };
        },

        onError: (_err, _taskId, context) => {
            if (context?.previousTasks) {
            queryClient.setQueryData(queryKey, context.previousTasks);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
}
