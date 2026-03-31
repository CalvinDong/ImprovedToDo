import TaskList from "../features/tasks/taskList"

export default function HomePage(){
    return(
        <div className="flex flex-col mx-3 gap-3">
            <div className="flex justify-start items-center gap-3">
                <h1 className="text-4xl font-bold">The Day</h1>
            </div>
            
            <TaskList list="tasks"/>
        </div>
        
    )
}