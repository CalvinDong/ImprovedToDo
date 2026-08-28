import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { motion } from "framer-motion";
import { useCompleteTaskMutation } from "../../hooks/useCompleteTaskMutation.ts";
import { useQuery } from "@tanstack/react-query";
import { tasksQueryOptions } from "../../api/taskQueries.ts";
import { useUpdateTaskMutation } from "../../hooks/useUpdateTaskMutation.ts";
import { useDeleteTaskMutation } from "../../hooks/useDeleteTaskMutation.ts";
import { useAutoResizeTextarea } from "../../hooks/useAutoResizeTextArea.ts";

import type { UpdateTaskRequest } from "@todo/contracts";

import Checkbox from "../../components/TaskCheckbox.tsx";

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

    const getDaysBetween = (date1: Date, date2: Date) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);

        d1.setHours(0, 0, 0, 0);
        d2.setHours(0, 0, 0, 0);

        const diffMs = Math.abs(d2.getTime() - d1.getTime());
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    };

    const convertDate = (utcDate: string) => {
        console.log(utcDate)
        if (utcDate == "0001-01-01T00:00:00+00:00"){
            return "--"
        }

        const localDate = new Date(utcDate);

        const dayString = localDate.toLocaleDateString("en-AU");
        const time = localDate.toLocaleTimeString("en-AU");

        //let displayDay = dayString === today ? "Today" : dayString;

        const diffDate = getDaysBetween(localDate, new Date());

        let displayDay;
        switch(true) {
            case(diffDate == 0):
                displayDay = "Today";
                break;
            case(diffDate == 1):
                displayDay = "Yesterday";
                break;
            case (diffDate >= 2 && diffDate <= 7):
                displayDay = `${diffDate} days ago`
                break;
            default:
                displayDay = dayString;
        } 

        return `${displayDay} at ${time}`;
    }   

    return (
        <div className="flex flex-col justify-between h-full p-4">
            <div>
                <div className="mb-4 flex justify-between min-w-0">
                    <motion.div 
                        initial={{ x: "2rem", opacity: 0 }}
                        animate={{ x: "0rem", opacity: 1 }}
                        exit={{ x: "2rem", opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-4 items-center w-full min-w-0" ref={containerRef}
                    >
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
                                ${selectedTask.completed ? "text-base-content/50 line-through" : ""}`
                            }
                            />
                    </motion.div>

                    <button className="btn btn-sm btn-ghost" onClick={onClose}>
                    ✕
                    </button>
                </div>

                <motion.div 
                    initial={{ x: "2rem", opacity: 0 }}
                    animate={{ x: "0rem", opacity: 1 }}
                    exit={{ x: "2rem", opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="divider">
                </motion.div>

                <motion.div 
                    initial={{ x: "2rem", opacity: 0 }}
                    animate={{ x: "0rem", opacity: 1 }}
                    exit={{ x: "2rem", opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-md bg-transparent"
                >
                    <textarea
                        className={`font-normal resize-none overflow-hidden whitespace-pre-wrap wrap-break-words outline-none bg-transparent w-full  
                                    ${selectedTask.completed ? "text-base-content/50" : ""}`
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
                </motion.div>
            </div>

            
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-xs text-base-content/50">Created: {convertDate(selectedTask.createdAtUtc)}</p>
                    <p className="text-xs text-base-content/50">Last Edited: {convertDate(selectedTask.updatedAtUtc)}</p>
                </div>
                <div>
                    <button className="btn btn-sm btn-neutral-content" 
                        onClick={() =>{ 
                            const taskId = selectedTask.id
                            flushSync(() => {
                                onClose();
                            });
                            deleteTaskMutation.mutate(taskId);
                        }}
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
