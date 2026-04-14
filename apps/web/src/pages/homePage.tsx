import { useOutletContext } from "react-router-dom";
import TaskList from "../features/tasks/taskList"
import type { AppShellOutletContext } from "../features/tasks/types";

export default function HomePage() {
  const { setSelectedTaskId, setSelectedTaskPanelKey } =
    useOutletContext<AppShellOutletContext>();

  function closePanel() {
    setSelectedTaskId(null);
    setSelectedTaskPanelKey(null);
  }

  return (
    <div
      className="h-full w-full p-6"
      onMouseDown={() => {
        closePanel();
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-start items-center gap-3 sticky top-0 z-50 bg-base-300">
          <h1 className="text-4xl font-bold">The Day</h1>
        </div>

        <div onMouseDown={(e) => e.stopPropagation()}>
            <TaskList list="tasks" />
        </div>
      </div>
    </div>
  );
}