import { createBrowserRouter } from "react-router-dom";
import AuthRoute from "./auth/authRoute";
import RootLayout from "./layouts/rootLayout";
import HomePage from "./pages/homePage";
import LogoutPage from "./pages/logoutPage";
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
      { path: "logout-page", element: <LogoutPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "auth/callback", element: <AuthCallbackPage /> },
      {
        element: <AuthRoute />,
        children: [
          { path: "app", element: <App /> },
          //{ path: "app/tasks", element: <TasksPage /> },
        ],
      },
    ],
  },
]);