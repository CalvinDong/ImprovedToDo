import { motion } from "framer-motion";
import type { TaskDto } from "@todo/contracts";

interface Props{
    selectedTask: TaskDto;
    onClose: () => void;
}

export default function SelectedTaskPanel({ selectedTask, onClose }: Props){
    return(
        <motion.div
            key={selectedTask.id}
            initial={{ x: "2rem", opacity: 0 }}
            animate={{ x: "0rem", opacity: 1 }}
            exit={{ x: "2rem", opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col h-full p-4"
        >
            <div className="mb-4 flex justify-between">
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