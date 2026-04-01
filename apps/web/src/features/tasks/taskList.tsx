import { useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, deleteTask, setCompleteTask, tasksQueryOptions } from "./taskQueries";
import TaskCard from "./taskCard.tsx";
import type { CreateTaskRequest, TaskDto, SetTaskCompletedRequest, UpdateTaskRequest } from "@todo/contracts";

interface Props {
  list: string;
}

type AppShellContext = {
  selectedTask: TaskDto | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<TaskDto | null>>;
};

type TaskViewModel = TaskDto & {
    isOptimistic?: boolean;
    clientId?: string;
};

type CreateTaskMutationInput = CreateTaskRequest & {
  clientId: string;
};

const TaskList = ({ list }: Props) => {
    const { setSelectedTask } = useOutletContext<AppShellContext>();
    const queryClient = useQueryClient();
    const queryKey = ["tasks", list];

    const {
        data: tasks = [],
        isLoading,
        isError,
        error,
    } = useQuery(tasksQueryOptions(list));

    const createTaskMutation = useMutation({
        mutationFn: async ({ clientId: _clientId, ...data }: CreateTaskMutationInput) => {
            //await new Promise((r) => setTimeout(r, 2000));
            return createTask(list, data);
        },
            

        onMutate: async (data) => {
            await queryClient.cancelQueries({ queryKey });

            const previousTasks = queryClient.getQueryData<TaskViewModel[]>(queryKey);

            queryClient.setQueryData<TaskViewModel[]>(queryKey, (old = []) => [
                ...old,
                {
                    id: data.clientId, // temp id for React key stability
                    clientId: data.clientId,
                    title: data.title,
                    completed: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isOptimistic: true,
                },
            ]);

            return { previousTasks, clientId: data.clientId };
        },

        onError: (_err, _newTask, context) => {
            if (context?.previousTasks) {
            queryClient.setQueryData(queryKey, context.previousTasks);
            }
        },

        onSuccess: (newTask, _variables, context) => {
            if (!context?.clientId) return;

            queryClient.setQueryData<TaskViewModel[]>(queryKey, (old = []) =>
            old.map((task) =>
                task.clientId === context.clientId
                ? newTask
                : task
            )
            );
            
            setSelectedTask(newTask);
        },

        /*onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },*/

    });

    const setCompleteMutation = useMutation({
        mutationFn: ({ list, id, completed }: { list: string, id: string, completed: boolean }) =>
            setCompleteTask(list, id, { completed }),

        onMutate: async ({ list, id, completed }) => {
            await queryClient.cancelQueries({ queryKey });

            const previousTasks = queryClient.getQueryData<TaskViewModel[]>(queryKey);

            queryClient.setQueryData<TaskViewModel[]>(queryKey, (old = []) =>
                old.map((task) =>
                    task.id === id ? { ...task, completed: completed } : task
                )
            );

            return { previousTasks };
        },

        onError: (_error, _variables, context) => {
            if (context?.previousTasks) {
            queryClient.setQueryData(queryKey, context.previousTasks);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const deleteTaskMutation = useMutation({
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

    if (isLoading) {
        return <div>Loading tasks...</div>;
    }

    if (isError) {
        return <div>{error instanceof Error ? error.message : "Failed to load tasks."}</div>;
    }

    return (
        <div className="flex flex-col gap-3">
                {tasks.map((item) => (
                    <TaskCard key={item.id} onClick={() => setSelectedTask(item)}>
                        <div className="flex justify-between w-full">
                            <div className="flex gap-3">
                                <input type="checkbox" checked={item.completed}
                                    className="
                                    checkbox
                                    checked:bg-primary checked:text-primary-content
                                    "
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) =>
                                        setCompleteMutation.mutate({
                                            list: list,
                                            id: item.id,
                                            completed: e.target.checked
                                        })
                                    }
                                        
                                >
                                </input>
                                <p className="card-title">{item.title}</p>
                            </div>
                            <div>
                                <button className="btn btn-xs btn-accent" 
                                    onClick={() => deleteTaskMutation.mutate(item.id)}
                                    >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </TaskCard>
                ))}

                <TaskCard>
                <input
                    type="text"
                    className="input shadow-none h-8 p-0 leading-none border-none bg-transparent w-full
                                   focus:outline-none focus:ring-0 focus:border-none focus:shadow-none"
                    placeholder="Add new task"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            const value = e.currentTarget.value.trim();
                            if (!value) return;
                            const response: CreateTaskMutationInput = {
                                clientId: crypto.randomUUID(),
                                title: value,
                                description: null,
                                listId: ""
                            }

                            createTaskMutation.mutate(response);
                            e.currentTarget.value = "";

                        }
                    }}
                />
                </TaskCard>

                {/* Explanation for div card height and padding above
                   h-16 = 4rem (total card height)
                   p-4 top + bottom = 2rem total 
                   remaining space = 2rem

                   input h-8 = 2rem

                   {
                    top pad (1 rem)
                    empty content area (2 rem)
                    bottom pad (1 rem)
                   }
                */}
            </div>
    );
};

export default TaskList;