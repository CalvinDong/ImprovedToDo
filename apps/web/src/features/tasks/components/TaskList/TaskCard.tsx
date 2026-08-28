type TaskCardProps = {
  onClick?: () => void;
  completed?: boolean | null
  children: React.ReactNode;
};

export default function TaskCard({ onClick, completed, children }: TaskCardProps) {
  return (
    <div
      className={`card card-xs bg-base-200 shadow-sm min-h-16 p-4! group 
                  hover:bg-primary-content transition-colors
                  ${completed ? "bg-base-200/15" : ""}
                  `
                }
      onClick={onClick}
    >
      <div className="flex h-full items-center justify-between w-full min-w-0">
        {children}
      </div>
    </div>
  );
}
