import {
  Panel,
  Group,
  Separator,
} from "react-resizable-panels";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../auth/authContext";

export default function AppShellLayout() {
  const selectedTask = null; // replace with real state
  const { logout } = useAuth();
  

  return (
    <div className="h-full">
      <Group className="flex h-full">
        <Panel defaultSize="0%" minSize="20%">
          <aside className="h-full border-r border-base-300 bg-base-200 px-5 py-2">
            <div className="flex flex-col">
              <Link to="/" className="my-1.5">Home</Link>
              <Link to="/the-day" className="my-1.5">The Day</Link>
              <Link to="/profile" className="my-1.5">Profile</Link>
              <button className="btn btn-primary" onClick={logout}>
                Logout
              </button>
              <div className="divider my-1.5 "></div>
            </div>
             
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