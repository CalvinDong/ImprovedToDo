import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext"

export default function LogoutPage(){
    const { clearSession } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        clearSession();
        navigate("/", { replace: true });
    }, []);

    return(
        <div className="min-h-screen grid place-items-center p-6">
            <h1> Logging Out</h1>
        </div>
    )
}