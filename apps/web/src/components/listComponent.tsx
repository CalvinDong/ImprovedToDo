import { useQuery } from "@tanstack/react-query";
import { getTasksList } from "../api/tasks";

interface Props {
  list: string;
}

const ListComponent = ({ list }: Props) => {
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tasks", list],
    queryFn: () => getTasksList(list),
    staleTime: 1000 * 60,
  });

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  if (isError) {
    return <div>{error instanceof Error ? error.message : "Failed to load tasks."}</div>;
  }

  return (
    <div className="flex flex-col justify-between gap-3">
      {tasks.map((item) => (
        <div key={item.id} className="card card-xs w-96 bg-base-200 shadow-sm p-4!">
          <div className="card-body gap-0">
            <div className="flex gap-2">
              <button className="btn btn-xs">t</button>
              <p className="card-title">{item.title}</p>
            </div>
            <div className="justify-end card-actions"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListComponent;