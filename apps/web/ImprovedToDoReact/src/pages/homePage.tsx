import { useEffect } from "react"
import { apiFetch } from "../api/apiFetch";

const res = async () => {
    let response = apiFetch("/tasks");
    console.log(await response);
    console.log((await response).body);
}

export default function HomePage(){
    useEffect(() => {
        res();
    }, [])
    return(
        <div className="min-h-screen grid place-items-center p-6">
            <h1> Welcome to Improved To Do</h1>
            <h2> You are logged in </h2>
            <button className="btn" onClick={res}> press me! </button>
        </div>
    )
}