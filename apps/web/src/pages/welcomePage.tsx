import { Link } from "react-router-dom";

export default function WelcomePage(){
    return(
        <div className="min-h-screen grid place-items-center p-6">
            <h1> Welcome to Improved To Do</h1>
            <Link to="/login" className="btn">Login</Link>
        </div>
    )
}