import { useDroppable } from "@dnd-kit/core";
import JobCard from "./JobCard";
import { STATUS_STYLES } from "../constants/status";

export default function KanbanColumn({
  status,
  jobs,
  onDelete,
  onEdit,
  onStatusChange,
  fullWidth = false,
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const styles = STATUS_STYLES[status];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl bg-champagne/40 p-3 transition-colors ${fullWidth ? "w-full" : "min-w-64 flex-1"} ${
        isOver ? "bg-yellowgreen/15 ring-2 ring-yellowgreen" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
          <h2 className="text-sm font-semibold text-slate-700">{status}</h2>
        </div>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 shadow-sm">
          {jobs.length}
        </span>
      </div>

      <div className="min-h-25 flex-1">
        {jobs.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-xs text-slate-400">
            No applications
          </div>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onDelete={onDelete}
              onEdit={onEdit}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
