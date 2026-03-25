import { createBrowserRouter } from "react-router-dom";
import AuthRoute from "./auth/authRoute";
import RootLayout from "./layouts/rootLayout";
import HomePage from "./pages/homePage";
import LogoutPage from "./pages/logoutPage";
import LoginPage from "./pages/loginPage";
import AuthCallbackPage from "./pages/authCallbackPage";
import LandingPage from "./pages/landingPage";
//import AppPage from "../pages/AppPage";
//import TasksPage from "../pages/TasksPage";
//import App from "./App";


export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, element: <LandingPage />},
      { path: "auth/callback", element: <AuthCallbackPage />},
      { path: "login", element: <LoginPage />},
    ]
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "home", element: <HomePage />},
      { path: "logout-page", element: <LogoutPage /> },
      {
        element: <AuthRoute />,
        children: [
          { path: "home", element: <HomePage /> },
          //{ path: "app/tasks", element: <TasksPage /> },
        ],
      },
    ],
  }
]);