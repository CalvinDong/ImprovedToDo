//import { useState, useEffect } from "react"
//import { apiFetch } from "../api/apiFetch";
//import type { TaskDto } from "../../../../../packages/contracts/src/task";
import ListComponent from "../components/list";

export default function HomePage(){
    return(
        <ListComponent list="tasks"/>
    )
}