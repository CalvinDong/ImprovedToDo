import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/authContext";

export default function RootLayout() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-base-200">
      <nav className="navbar bg-base-100 shadow-sm px-4">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl">
            Todo App
          </Link>
        </div>

        <div className="flex gap-2">
          <Link to="/" className="btn btn-ghost">
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/app" className="btn btn-ghost">
                App
              </Link>
              <Link to="/app/tasks" className="btn btn-ghost">
                Tasks
              </Link>
              <button className="btn btn-primary" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
          )}
        </div>
      </nav>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}