import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { tasksQueryOptions } from "./taskQueries";
import { isSortableOperation, useSortable } from '@dnd-kit/react/sortable';
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';
import { arrayMove } from '@dnd-kit/helpers';
import { useCompleteTaskMutation } from "./hooks/useCompleteTaskMutation.ts";
import { useCreateTaskMutation } from "./hooks/useCreateTaskMutation.ts";
import { useReorderTaskMutation } from "./hooks/useReorderTaskMutation.ts";
import { LexoRank } from "./lexoRank.ts";

import TaskCard from "./taskCard.tsx";
import Checkbox from "./components/checkbox.tsx";
import SortDropdown from "./components/sortDropdown.tsx";

import type { CreateTaskMutationInput, TaskViewModel } from "./types.ts";
import type { AppShellOutletContext } from "./types.ts";
import type { SortState } from "./types.ts";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";



interface Props {
  list: string;
}

type SortableProps = {
  item: TaskViewModel;
  index: number;
};

const TaskList = ({ list }: Props) => {
    /*const createRange = (start: number, end: number, step: number = 1): number[] => {
        const length = Math.max(Math.ceil((end - start) / step), 0);
        return Array.from({ length }, (_, i) => start + i * step);
    };

    type Sortable2Props = {
        id: number;
        index: number;
    };

    function Sortable2({ id, index }: Sortable2Props) {
        const {ref} = useSortable({id, index});

        return (
            <li ref={ref} className="item">Item {id}</li>
        );
    }

    const [items, setItems] = useState(createRange(0, 100));*/

    const { setSelectedTaskId, selectedTaskId, setSelectedTaskPanelKey, selectedTaskPanelKey } = useOutletContext<AppShellOutletContext>();
    const defaultOption = { value: "default", label: "Default", supportsDirection: false }
    const defaultState: SortState<string> = { field: "default", direction: "asc"}
    const sortOptions = [
        defaultOption,
        { value: "created", label: "Created date", supportsDirection: true },
        { value: "edited", label: "Edited date", supportsDirection: true },
        { value: "alphabetical", label: "Alphabetical", supportsDirection: true },
        { value: "tags", label: "Tags", supportsDirection: true },
    ] as const;

    type TaskSortField = (typeof sortOptions)[number]["value"];
    const [sort, setSort] = useState<SortState<TaskSortField>>(defaultState);

    const completeTaskMutation = useCompleteTaskMutation(list);
    const createTaskMutation = useCreateTaskMutation(list);
    const reorderTaskMutation = useReorderTaskMutation(list);

    const handleSubmit = (title: string, openPanel: boolean, listLength: number) => {
        const trimmed = title.trim();
        if (!trimmed) return;

        const response: CreateTaskMutationInput = {
            clientId: crypto.randomUUID(),
            title: title,
            description: null,
            listId: "",
            lexoRank: LexoRank.between(tasks[tasks.length - 1].lexoRank)
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
                tasks.concat(newTask);
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
        console.log("openPanel", { id, clientId });
        if (id === selectedTaskId || clientId === selectedTaskPanelKey){
            setSelectedTaskId(null);
            setSelectedTaskPanelKey(null);
            return;
        }
        setSelectedTaskId(id)
        setSelectedTaskPanelKey(clientId ?? id);
    }

    function handleDragEnd(event: Parameters<DragEndEvent>[0]) {
        if (
            event.canceled ||
            sort.field !== "default" ||
            !isSortableOperation(event.operation)
        ) return;

        const { source } = event.operation;

        if (!source) return;

        const taskId = String(source.id);
        const sourceIndex = source.initialIndex;
        const targetIndex = source.index;

        if (sourceIndex === targetIndex) return;

        const reorderedTasks = arrayMove(tasks, sourceIndex, targetIndex);
        const previousTask = reorderedTasks[targetIndex - 1];
        const nextTask = reorderedTasks[targetIndex + 1];
        const lexoRank = LexoRank.between(
            previousTask?.lexoRank,
            nextTask?.lexoRank
        );

        reorderTaskMutation.mutate({
            taskId,
            sourceIndex,
            targetIndex,
            lexoRank,
        });
    }

    function Sortable({ item, index }: SortableProps) {
        const [element, setElement] = useState<Element | null>(null);
        const handleRef = useRef<HTMLButtonElement | null>(null);
        const isCustomSort = sort.field === "default";
        const {isDragging} = useSortable({
            id: item.id, 
            index, element, 
            handle: handleRef,
            disabled: !isCustomSort
        });

        /*const { isDragging } = useSortable({
            id: item.id,
            index,
            element,
            handle: handleRef,
        });*/

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
                        {isCustomSort ? <button
                            ref={handleRef}
                            type="button"
                            className="shrink-0 cursor-grab"
                            aria-label="Drag task"
                        >
                            ⋮⋮
                        </button> : <div/>}
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
    /*let counter = 0; # convert this to a check that ensures that every task has a position number assigned so dnd kit doesn't break
    const newTasks = tasks.map((item) => {
        const updated = {
            ...item,
            order: counter
        };
        
        counter += 1;

        return updated
    })*/ 

    const sortedTasks = useMemo(() => {
        const tasksCopy = [...tasks];

        switch(sort.field){
            case "created":
                tasksCopy.sort((a, b) => {
                    const aTime = new Date(a.createdAtUtc).getTime();
                    const bTime = new Date(b.createdAtUtc).getTime();
                    return sort.direction === "asc" ? aTime - bTime : bTime - aTime;
                });
                break;

            case "edited":
                tasksCopy.sort((a, b) => {
                    const aTime = new Date(a.updatedAtUtc).getTime();
                    const bTime = new Date(b.updatedAtUtc).getTime();
                    return sort.direction === "asc" ? aTime - bTime : bTime - aTime;
                });
                break;
                
            case "alphabetical":
                tasksCopy.sort((a, b) => {
                    const result = a.title.localeCompare(b.title);
                    return sort.direction === "asc" ? result : -result
                });
                break;

            case "default":
                break;
        }
        return tasksCopy;
    }, [tasks, sort])

    if (isLoading) {
        return <div>Loading tasks...</div>;
    }

    if (isError) {
        return <div>{error instanceof Error ? error.message : "Failed to load tasks."}</div>;
    }
    

    return (
        <AnimatePresence mode="popLayout">
            <div className="h-full">
                <div
                    className="flex flex-col gap-3 mb-3 min-h-full"
                    onMouseDown={(e) => {
                        /*if (e.target === e.currentTarget) {
                        setSelectedTaskId(null);
                        setSelectedTaskPanelKey(null);
                        }*/
                    }}
                >
                    <div className="flex items-center justify-between sticky top-0 z-50 bg-base-300">
                        <h1 className="text-4xl font-bold">The Day</h1>
                        <SortDropdown
                            options={sortOptions}
                            sort={sort}
                            defaultState={defaultState}
                            onSortChange={setSort}
                        />
                    </div>

                    {reorderTaskMutation.isError && (
                        <div role="alert" className="alert alert-error">
                            <span>
                                The task could not be moved. Its previous position has been restored.
                            </span>
                            <button
                                type="button"
                                className="btn btn-sm"
                                onClick={() => reorderTaskMutation.reset()}
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    <DragDropProvider onDragEnd={handleDragEnd}>
                        {sortedTasks.map((item, index) => (
                            <Sortable
                                key={item.clientId ?? item.id}
                                item={item}
                                index={index}
                            />
                        ))}
                    </DragDropProvider>

                    {/*<ul className="list">
                        {items.map((id, index) =>
                            <Sortable2 key={id} id={id} index={index} />
                        )}
                    </ul>*/}

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
                            handleSubmit(value, e.shiftKey, tasks.length);
                            e.currentTarget.value = "";
                            }
                        }}
                        />
                    </TaskCard>
                </div>
                <button className="btn" onClick={() => console.log(tasks)}></button>
            </div>
        </AnimatePresence>
    );
};

export default TaskList;
