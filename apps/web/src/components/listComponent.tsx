import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { tasksQueryOptions } from "../queries/taskQueries";
import { motion, AnimatePresence } from "framer-motion";
import type { TaskDto } from "@todo/contracts";

interface Props {
  list: string;
}

type AppShellContext = {
  selectedTask: TaskDto | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<TaskDto | null>>;
};

const ListComponent = ({ list }: Props) => {
    const { setSelectedTask, selectedTask } = useOutletContext<AppShellContext>();

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
            <AnimatePresence mode="wait">
                {tasks.map((item) => (
                <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="card card-xs bg-base-200 shadow-sm p-4!"
                >
                    <div className="card-body gap-0">
                    <div className="flex gap-2">
                        <button className="btn btn-xs" onClick={() => setSelectedTask(item)}>t</button>
                        <p className="card-title">{item.title}</p>
                    </div>
                    <div className="justify-end card-actions"></div>
                    </div>
                </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ListComponent;