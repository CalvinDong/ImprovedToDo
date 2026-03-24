import { useEffect } from "react";
import { useAuth } from "../auth/authContext";

export default function LoginPage() {
  const { login } = useAuth();

  useEffect(() => {
    void login();
  }, [login]);

  return(
    <div className="flex items-center justify-center h-screen">
      <div className="loading loading-ring loading-xl"></div>
    </div>
  );
}