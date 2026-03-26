import ListComponent from "../components/listComponent";

export default function HomePage(){
    return(
        <div className="flex flex-col my-2 mx-3 gap-3">
            <h1>The Day</h1>
            <ListComponent list="tasks"/>
        </div>
        
    )
}