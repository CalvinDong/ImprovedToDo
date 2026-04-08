import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "../taskQueries";
import type { CreateTaskMutationInput, TaskViewModel } from "../types";
import { delay } from "framer-motion";

type CreateTaskContext = {
  previousTasks?: TaskViewModel[];
  clientId: string;
};

type UseCreateTaskMutationOptions = {
  onMutate?: (variables: CreateTaskMutationInput) => void;
  onSuccess?: (
    newTask: TaskViewModel,
    variables: CreateTaskMutationInput,
    context: CreateTaskContext | undefined
  ) => void;
  onError?: (
    error: Error,
    variables: CreateTaskMutationInput,
    context: CreateTaskContext | undefined
  ) => void;
};

export function useCreateTaskMutation(
  list: string,
  options?: UseCreateTaskMutationOptions
) {
  const queryClient = useQueryClient();
  const queryKey = ["tasks", list];

  return useMutation<TaskViewModel, Error, CreateTaskMutationInput, CreateTaskContext>({
    mutationFn: async ({ clientId: _clientId, ...data }) => {
      return createTask(list, data);
    },

    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey });

      const previousTasks = queryClient.getQueryData<TaskViewModel[]>(queryKey);

      queryClient.setQueryData<TaskViewModel[]>(queryKey, (old = []) => [
        ...old,
        {
          id: data.clientId,
          clientId: data.clientId,
          title: data.title,
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isOptimistic: true,
        },
      ]);

      const context = {
        previousTasks,
        clientId: data.clientId,
      };

      options?.onMutate?.(data);

      return context;
    },

    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }

      options?.onError?.(err, variables, context);
    },

    onSuccess: (newTask, variables, context) => {
      if (!context?.clientId) return;

      queryClient.setQueryData<TaskViewModel[]>(queryKey, (old = []) =>
        old.map((task) =>
          task.clientId === context.clientId
            ? { ...newTask, clientId: context.clientId }
            : task
        )
      );

      options?.onSuccess?.(newTask, variables, context);
    },
  });
}