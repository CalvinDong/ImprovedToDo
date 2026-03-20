import { useEffect } from "react"
import { useAuth } from "../auth/authContext"

export default function HomePage(){
    return(
        <div className="min-h-screen grid place-items-center p-6">
            <h1> Welcome to Improved To Do</h1>
        </div>
    )
}