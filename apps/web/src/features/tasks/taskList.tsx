import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { tasksQueryOptions } from "./taskQueries";
import { useCompleteTaskMutation } from "./hooks/useCompleteTaskMutation.ts";
import { useCreateTaskMutation } from "./hooks/useCreateTaskMutation.ts";

import TaskCard from "./taskCard.tsx";
import Checkbox from "./components/checkbox.tsx";

import type { CreateTaskMutationInput, TaskViewModel } from "./types.ts";
import type { AppShellOutletContext } from "./types.ts";
import type { TaskDto } from "@todo/contracts";

interface Props {
  list: string;
}

const TaskList = ({ list }: Props) => {
    const { setSelectedTaskId, setSelectedTaskPanelKey } = useOutletContext<AppShellOutletContext>();

    const completeTaskMutation = useCompleteTaskMutation(list);
    const createTaskMutation = useCreateTaskMutation(list);

    const handleSubmit = (title: string, openPanel: boolean) => {
        const trimmed = title.trim();
        if (!trimmed) return;

        const response: CreateTaskMutationInput = {
            clientId: crypto.randomUUID(),
            title: title,
            description: null,
            listId: ""
        }

        if (openPanel) {
            setSelectedTaskId(response.clientId);
            setSelectedTaskPanelKey(response.clientId)
        }

        createTaskMutation.mutate(response, {
            onSuccess: (newTask, _variables, context) => {
                if (openPanel) {
                    setSelectedTaskId((current) =>
                        current === context?.clientId ? newTask.id : current
                    );
                }
            },
            onError: (_error, _variables, context) => {
                if (openPanel) {
                        setSelectedTaskId((current) =>
                        current === context?.clientId ? null : current
                    );
                        setSelectedTaskPanelKey((current) =>
                        current === context?.clientId ? null : current
                    );
                }
            },
        });
    };

    const {
        data: tasks = [],
        isLoading,
        isError,
        error,
    } = useQuery(tasksQueryOptions(list));

    if (isLoading) {
        return <div>Loading tasks...</div>;
    }

    if (isError) {
        return <div>{error instanceof Error ? error.message : "Failed to load tasks."}</div>;
    }

    return (
        <div className="flex flex-col gap-3">
                {tasks.map((item) => (
                    <TaskCard
                        key={item.id}
                        completed={item.completed}
                        onClick={() => {
                            setSelectedTaskId(item.id)
                            setSelectedTaskPanelKey(item.clientId ?? item.id);
                        }}
                    >
                        <div className="flex w-full min-w-0">
                            <div className="flex flex-1 min-w-0 items-center gap-3">
                                <div className="shrink-0 self-center">
                                    <Checkbox
                                    checked={item.completed}
                                    onChange={(checked) =>
                                        completeTaskMutation.mutate({
                                            id: item.id,
                                            completed: { completed: checked },
                                        })
                                    }
                                    />
                                </div>

                                <p
                                    className={`card-title flex-1 min-w-0 hover:cursor-default whitespace-pre-wrap break-all leading-tight ${
                                    item.completed ? "text-base-content/50 line-through" : ""
                                    }`}
                                >
                                    {item.title}
                                </p>
                            </div>
                        </div>
                    </TaskCard>
                ))}

                <TaskCard>
                <input
                    type="text"
                    className="input shadow-none p-0 leading-none border-none bg-transparent w-full break-all
                               focus:outline-none focus:ring-0 focus:border-none focus:shadow-none"
                    placeholder="Add new task"
                    maxLength={100}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            const value = e.currentTarget.value.trim();
                            if (!value) return;
                            handleSubmit(value, e.shiftKey);
                            //createTaskMutation.mutate(response);
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