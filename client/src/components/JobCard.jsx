import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Trash2, Pencil } from "lucide-react";
import { STATUSES, STATUS_STYLES } from "../constants/status";
import ConfirmDialog from "./ConfirmDialog";

export default function JobCard({
  job,
  overlay = false,
  onDelete,
  onEdit,
  onStatusChange,
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: job._id,
  });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const styles = STATUS_STYLES[job.status];
  const appliedDate = job.appliedDate
    ? new Date(job.appliedDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
      className={`relative mb-3 rounded-xl border-l-4 bg-white p-3.5 shadow-sm ring-1 ring-slate-900/5 transition-all ${styles.accent} ${
        overlay
          ? "rotate-2 scale-105 shadow-xl"
          : "cursor-grab hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing"
      } ${isDragging && !overlay ? "opacity-0" : ""}`}
    >
      {!overlay && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(job);
            }}
            aria-label="Edit job application"
            className="rounded p-1 text-slate-300 hover:bg-hunter/10 hover:text-hunter"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setConfirmOpen(true);
            }}
            aria-label="Delete job application"
            className="rounded p-1 text-slate-300 hover:bg-brick/10 hover:text-brick"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      <p className="pr-12 font-semibold text-slate-800">{job.role}</p>
      <p className="mt-0.5 text-sm text-slate-500">{job.company}</p>
      {appliedDate && (
        <p className="mt-2 text-xs font-medium text-slate-400">
          Applied {appliedDate}
        </p>
      )}

      {!overlay && (
        <select
          value={job.status}
          onChange={(e) => onStatusChange(job._id, e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="mt-2.5 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 focus:border-hunter focus:outline-none focus:ring-4 focus:ring-hunter/10 sm:hidden"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      {confirmOpen && (
        <ConfirmDialog
          title="Delete job application"
          message={`Are you sure you want to delete the application for ${job.role} at ${job.company}? This can't be undone.`}
          confirmLabel="Delete"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            onDelete(job._id);
          }}
        />
      )}
    </div>
  );
}
