import { motion } from "framer-motion";
import Checkbox from "./components/checkbox.tsx";
import type { TaskDto } from "@todo/contracts";
import { useCompleteTaskMutation } from "./hooks/useCompleteTaskMutation.tsx";
import { useQuery } from "@tanstack/react-query";
import { tasksQueryOptions } from "./taskQueries.ts";

interface Props{
    selectedTaskId: string;
    list: string
    onClose: () => void;
}

export default function SelectedTaskPanel({ selectedTaskId, list, onClose }: Props){
    const completeTaskMutation = useCompleteTaskMutation(list);
    const { data: tasks = [] } = useQuery(tasksQueryOptions(list));

    const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;

    if (!selectedTask) return null;

    return(
        <motion.div
            key={selectedTaskId}
            initial={{ x: "2rem", opacity: 0 }}
            animate={{ x: "0rem", opacity: 1 }}
            exit={{ x: "2rem", opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col h-full p-4"
        >
            <div className="mb-4 flex justify-between">
            <Checkbox
                checked={selectedTask?.completed ?? false}
                onChange={(checked) => {
                    if (!selectedTask) return;

                    completeTaskMutation.mutate({
                        id: selectedTask.id,
                        completed: { completed: checked },
                    });
                }}
            />
            <h2 className="text-xl font-semibold">{selectedTask.title}</h2>
            <button
                className="btn btn-sm btn-ghost"
                onClick={() => onClose()}
            >
                ✕
            </button>
            </div>

            <div className="space-y-2">
            <p className="text-md font-semibold text-base-content/70">
                {selectedTask.description}
            </p>
            </div>
        </motion.div>
    )
}