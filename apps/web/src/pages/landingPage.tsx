import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/authContext"
import WelcomePage from "./welcomePage";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  //return <div>Loading...</div>;

  return isAuthenticated
    ? <Navigate to="/home" replace />
    : <WelcomePage />;
}