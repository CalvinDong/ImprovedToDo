import { useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, tasksQueryOptions } from "../queries/taskQueries";
import { AnimatePresence } from "framer-motion";
import TaskCard from "./cardComponent";
import type { CreateTaskRequest, TaskDto } from "@todo/contracts";

interface Props {
  list: string;
}

type AppShellContext = {
  selectedTask: TaskDto | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<TaskDto | null>>;
};

const ListComponent = ({ list }: Props) => {
    const { setSelectedTask } = useOutletContext<AppShellContext>();
    const queryClient = useQueryClient();

    const {
        data: tasks = [],
        isLoading,
        isError,
        error,
    } = useQuery(tasksQueryOptions(list));

    const createTaskMutation = useMutation({
        mutationFn: (data: CreateTaskRequest) => createTask(list, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", list] });
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
            <AnimatePresence mode="wait">
                {tasks.map((item) => (
                    <TaskCard key={item.id} onClick={() => setSelectedTask(item)}>
                        <p className="card-title">{item.title}</p>
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
                        const response:CreateTaskRequest = {title: value,
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
            </AnimatePresence>
            </div>
    );
};

export default ListComponent;