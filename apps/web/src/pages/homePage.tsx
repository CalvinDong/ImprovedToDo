import { useOutletContext } from "react-router-dom";
import TaskList from "../features/tasks/components/TaskList/TaskList"
import type { AppShellOutletContext } from "../features/tasks/model/taskTypes";

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
        <div onMouseDown={(e) => e.stopPropagation()}>
            <TaskList list="tasks" />
        </div>
      </div>
    </div>
  );
}
