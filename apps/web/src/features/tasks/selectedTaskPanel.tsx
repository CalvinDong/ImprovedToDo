import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { motion } from "framer-motion";
import { useCompleteTaskMutation } from "./hooks/useCompleteTaskMutation.ts";
import { useQuery } from "@tanstack/react-query";
import { tasksQueryOptions } from "./taskQueries.ts";
import { useUpdateTaskMutation } from "./hooks/useUpdateTaskMutation.ts";
import { useDeleteTaskMutation } from "./hooks/useDeleteTaskMutation.ts";
import { useAutoResizeTextarea } from "./hooks/useAutoResizeTextArea.ts";

import type { UpdateTaskRequest } from "@todo/contracts";

import Checkbox from "./components/checkbox.tsx";

interface Props {
  selectedTaskId: string;
  list: string;
  onClose: () => void;
}

export default function SelectedTaskPanel({
  selectedTaskId,
  list,
  onClose,
}: Props) {
    const completeTaskMutation = useCompleteTaskMutation(list);
    const updateTaskMutation = useUpdateTaskMutation(list);
    const deleteTaskMutation = useDeleteTaskMutation(list);

    const { data: tasks = [] } = useQuery(tasksQueryOptions(list));

    const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const titleRef = useRef<HTMLTextAreaElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

    useAutoResizeTextarea({
        textareaRef: titleRef,
        containerRef,
        value: title,
    });

    useAutoResizeTextarea({
        textareaRef: descriptionRef,
        value: description,
    });

    useEffect(() => {
        if (selectedTask) {
            setTitle(selectedTask.title);
            setDescription(selectedTask.description ?? "");
        }
    }, [selectedTask?.id, selectedTask?.title, selectedTask?.description]);

    if (!selectedTask) return null;

    const saveTaskEdits = () => {
        if (!selectedTask) return;

        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();

        const originalTitle = selectedTask.title;
        const originalDescription = selectedTask.description ?? "";

        if (!trimmedTitle) {
            setTitle(originalTitle);
            return;
        }

        const updatedFields: Partial<UpdateTaskRequest> = {};

        if (trimmedTitle !== originalTitle) {
            updatedFields.title = trimmedTitle;
        }

        if (trimmedDescription !== originalDescription) {
            updatedFields.description = trimmedDescription;
        }

        if (Object.keys(updatedFields).length === 0) {
            return;
        }

        updateTaskMutation.mutate({
            taskId: selectedTask.id,
            data: updatedFields,
        });
    };

    return (
        <motion.div
        initial={{ x: "2rem", opacity: 0 }}
        animate={{ x: "0rem", opacity: 1 }}
        exit={{ x: "2rem", opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col h-full p-4"
        >
            <div className="mb-4 flex justify-between min-w-0">
                <div className="flex gap-4 items-center w-full min-w-0" ref={containerRef}>
                <Checkbox
                    checked={selectedTask.completed ?? false}
                    onChange={(checked) => {
                    completeTaskMutation.mutate({
                        id: selectedTask.id,
                        completed: { completed: checked },
                    });
                    }}
                />
                
                <textarea
                    ref={titleRef}
                    rows={1}
                    value={title}
                    maxLength={100}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={saveTaskEdits}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                        e.currentTarget.blur();
                        }

                        if (e.key === "Escape") {
                        setTitle(selectedTask.title);
                        setDescription(selectedTask.description ?? "");
                        e.currentTarget.blur();
                        }
                    }}
                    className={`text-xl font-semibold wrap-break-word min-w-0 resize-none overflow-hidden bg-transparent w-full leading-tight p-0 border-0 outline-none shadow-none
                        ${selectedTask.completed ? "text-base-content/30 line-through" : ""}`
                    }
                    />
                </div>

                <button className="btn btn-sm btn-ghost" onClick={onClose}>
                ✕
                </button>
        </div>

        <div className="divider"></div>

        <div className="text-md bg-transparent">
            <textarea
                className={`font-normal resize-none overflow-hidden whitespace-pre-wrap wrap-break-words outline-none bg-transparent w-full  
                            ${selectedTask.completed ? "text-base-content/30" : ""}`
                        }
                ref={descriptionRef}
                placeholder="Add notes here"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={saveTaskEdits}
                onKeyDown={(e) => {

                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();       
                        saveTaskEdits();           
                        e.currentTarget.blur();    
                    }

                    if (e.key === "Escape") {
                    setTitle(selectedTask.title);
                    setDescription(selectedTask.description ?? "");
                    e.currentTarget.blur();
                    }
                }}
                />
        </div>
        <button className="btn btn-xs btn-accent" 
                onClick={() =>{ 
                    const taskId = selectedTask.id
                    flushSync(() => {
                        onClose();
                    });
                    deleteTaskMutation.mutate(taskId);
                }}
                >
                Delete
            </button>
        </motion.div>
    );
}