import { createBrowserRouter } from "react-router-dom";
import RequireAuth from "./auth/requireAuth";
import RootLayout from "./layouts/rootLayout";
import HomePage from "./pages/homePage";
import LoginPage from "./pages/loginPage";
import AuthCallbackPage from "./pages/authCallbackPage";
//import AppPage from "../pages/AppPage";
//import TasksPage from "../pages/TasksPage";
import App from "./App";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "auth/callback", element: <AuthCallbackPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: "app", element: <App /> },
          //{ path: "app/tasks", element: <TasksPage /> },
        ],
      },
    ],
  },
]);