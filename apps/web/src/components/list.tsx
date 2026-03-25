import { useEffect, useState } from "react";
import { getTasksList } from "../api/tasks";
import type { TaskDto } from "@todo/contracts";

interface Props {
  list: string;
}

const ListComponent = (props : Props) => {
    const [tasks, setTasks] = useState<TaskDto[]>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            let test = await getTasksList(`${props.list}`); 
            setTasks(test);
        }

        fetchTasks();
    }, [])
    
    return (
        <div className="flex flex-col justify-between gap-3">
            {tasks.map((item: TaskDto) => (
                <div className="card card-xs w-96 bg-base-200 shadow-sm p-4!">
                    <div key={item.id} className="card-body gap-0">
                        <div className="flex gap-2">
                            <button className="btn btn-xs">t</button>
                            <p className="card-title">{item.title}</p>
                        </div>
                        <div className="justify-end card-actions"></div>
                    </div>
                </div>
            ))}
        </div>
    )  
};

export default ListComponent;