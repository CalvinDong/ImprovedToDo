type TaskCardProps = {
  onClick?: () => void;
  children: React.ReactNode;
};

export default function TaskCard({ onClick, children }: TaskCardProps) {
  return (
    <div
      className="card card-xs bg-base-200 shadow-sm h-16 !p-4 group
                 hover:bg-primary-content transition-colors"
      onClick={onClick}
    >
      <div className="flex h-full items-center w-full">
        {children}
      </div>
    </div>
  );
}