import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Checkbox from "./components/checkbox.tsx";
import { useCompleteTaskMutation } from "./hooks/useCompleteTaskMutation.tsx";
import { useQuery } from "@tanstack/react-query";
import { tasksQueryOptions } from "./taskQueries.ts";
import { useUpdateTaskMutation } from "./hooks/useUpdateTaskMutation.tsx";
import type { UpdateTaskRequest } from "@todo/contracts";

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
  const { data: tasks = [] } = useQuery(tasksQueryOptions(list));

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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
      key={selectedTaskId}
      initial={{ x: "2rem", opacity: 0 }}
      animate={{ x: "0rem", opacity: 1 }}
      exit={{ x: "2rem", opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full p-4"
    >
      <div className="mb-4 flex justify-between">
        <div className="flex gap-4 items-center w-full">
          <Checkbox
            checked={selectedTask.completed ?? false}
            onChange={(checked) => {
              completeTaskMutation.mutate({
                id: selectedTask.id,
                completed: { completed: checked },
              });
            }}
          />

          <input
            value={title}
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
            className="text-xl font-semibold bg-transparent border-none outline-none w-full"
          />
        </div>

        <button className="btn btn-sm btn-ghost" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="text-md bg-transparent">
        <textarea
            className="resize-none overflow-hidden whitespace-pre-wrap wrap-break-words outline-none bg-transparent w-full"
            placeholder="Add notes here"
            value={description}
            onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";              // reset first
                el.style.height = el.scrollHeight + "px"; // grow to fit content
            }}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={saveTaskEdits}
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                setTitle(selectedTask.title);
                setDescription(selectedTask.description ?? "");
                e.currentTarget.blur();
                }
            }}
            />
      </div>
    </motion.div>
  );
}