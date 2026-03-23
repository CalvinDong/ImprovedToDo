import {
  Panel,
  Group,
  Separator,
} from "react-resizable-panels";
import { Outlet } from "react-router-dom";

export default function AppShellLayout() {
  const selectedTask = null; // replace with real state

  return (
    <div className="h-full">
      <Group className="flex h-full">
        <Panel defaultSize="0%" minSize="20%">
          <aside className="h-full border-r border-base-300 bg-base-200">
            Left nav
          </aside>
        </Panel>

        <Separator className="w-1 bg-base-300 hover:bg-primary transition-colors" />

        <Panel defaultSize={selectedTask ? 55 : 80} minSize="20%">
          <main className="h-full bg-base-100 min-h-0">
            <Outlet />
          </main>
        </Panel>

        {selectedTask && (
          <>
            <Separator className="w-1 bg-base-300 hover:bg-primary transition-colors" />
            <Panel defaultSize="0%" minSize="20%" collapsible>
              <aside className="h-full border-l border-base-300 bg-base-200">
                Task details
              </aside>
            </Panel>
          </>
        )}
      </Group>
    </div>
  );
}