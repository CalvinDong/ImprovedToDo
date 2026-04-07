import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "../taskQueries";
import type { TaskViewModel, UpdateTaskMutationInput } from "../types";
import type { UpdateTaskRequest } from "@todo/contracts";

export function useUpdateTaskMutation(list: string){
    const queryClient = useQueryClient();
    const queryKey = ["tasks", list];

    return useMutation({
        mutationFn: ({ taskId, data }: UpdateTaskMutationInput) => 
            updateTask(list, taskId, data),

        onMutate: async({ taskId, data }) => {
             await queryClient.cancelQueries({ queryKey });

             const previousTasks = queryClient.getQueryData<TaskViewModel[]>(queryKey);

             queryClient.setQueryData<TaskViewModel[]>(queryKey, (old = []) =>
                old.map((task) =>
                task.id === taskId
                    ? { 
                        ...task, 
                        ...data,
                        isOptimistic: true,
                        updatedAt: new Date().toISOString(),
                    }
                    : task
                )
            );

            return { previousTasks };
        },

        onError: (_err, _variables, context) => {
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
    })
}