import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { tasksQueryOptions } from "./taskQueries";
import { useSortable } from '@dnd-kit/react/sortable';
import { useCompleteTaskMutation } from "./hooks/useCompleteTaskMutation.ts";
import { useCreateTaskMutation } from "./hooks/useCreateTaskMutation.ts";

import TaskCard from "./taskCard.tsx";
import Checkbox from "./components/checkbox.tsx";

import type { CreateTaskMutationInput, TaskViewModel } from "./types.ts";
import type { AppShellOutletContext } from "./types.ts";
import { useEffect, useRef, useState } from "react";

interface Props {
  list: string;
}

type SortableProps = {
  item: TaskViewModel;
  index?: number;
};

const TaskList = ({ list }: Props) => {
    const { setSelectedTaskId, selectedTaskId, setSelectedTaskPanelKey, selectedTaskPanelKey } = useOutletContext<AppShellOutletContext>();

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

    function openPanel(id: string, clientId?: string){
        if (id === selectedTaskId || clientId === selectedTaskPanelKey){
            setSelectedTaskId(null);
            setSelectedTaskPanelKey(null);
            return;
        }

        setSelectedTaskId(id)
        setSelectedTaskPanelKey(clientId ?? id);

    }

    function Sortable({ item, index }: SortableProps) {
        const [element, setElement] = useState<Element | null>(null);
        const handleRef = useRef<HTMLButtonElement | null>(null);
        if (item.order === undefined){
            item.order = Math.floor(Math.random() * (999 - 0 + 1)) + 0;
        }

        const { isDragging } = useSortable({
            id: item.id,
            index: item.order,
            element,
            handle: handleRef,
        });

        return (
            <div ref={setElement} data-shadow={isDragging || undefined}>
                <TaskCard
                    completed={item.completed}
                    onClick={() => openPanel(item.id, item.clientId)}
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
                        <button
                            ref={handleRef}
                            type="button"
                            className="shrink-0 cursor-grab"
                            aria-label="Drag task"
                        >
                            ⋮⋮
                        </button>
                    </div>
                </TaskCard>
            </div>
        );
    }

    const {
        data: tasks = [],
        isLoading,
        isError,
        error,
    } = useQuery(tasksQueryOptions(list));

    //tasks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    let counter = 0;
    const newTasks = tasks.map((item) => {
        const updated = {
            ...item,
            order: counter
        };
        
        counter += 1;

        return updated
    })

    if (isLoading) {
        return <div>Loading tasks...</div>;
    }

    if (isError) {
        return <div>{error instanceof Error ? error.message : "Failed to load tasks."}</div>;
    }

    return (
        <div className="h-full" onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
                setSelectedTaskId(null)
                setSelectedTaskPanelKey(null)
            }
        }}>
            <div className="flex flex-col gap-3 mb-3">
                {newTasks.map((item) => (
                    <Sortable key={item.id} item={item} index={item.order} />
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
        </div>
    );
};

export default TaskList;