import { useEffect } from "react";
import { useAuth } from "../auth/authContext";

export default function LoginPage() {
  const { login } = useAuth();

  useEffect(() => {
    void login();
  }, [login]);

  return <div>Redirecting to sign in...</div>;
}