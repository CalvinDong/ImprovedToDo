import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleAuthCallback } from "../auth/authService";
import { useAuth } from "../auth/authContext";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { syncFromStorage, clearSession } = useAuth();
  const [error, setError] = useState("");
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    async function run() {
      try {
        await handleAuthCallback(window.location.search);
        syncFromStorage();
        navigate("/app", { replace: true });
      } catch (err) {
        clearSession();

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Authentication failed.");
        }
      }
    }

    void run();
  }, [navigate, syncFromStorage, clearSession]);

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="alert alert-error max-w-lg">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <span className="loading loading-spinner loading-lg" />
    </div>
  );
}