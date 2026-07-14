import { STATUSES, STATUS_STYLES } from "../constants/status";

export default function StatusTabs({ activeStatus, onChange }) {
  return (
    <div role="tablist" className="mb-4 grid grid-cols-4 gap-2">
      {STATUSES.map((status) => {
        const isActive = status === activeStatus;
        const styles = STATUS_STYLES[status];

        return (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(status)}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
              isActive
                ? "bg-hunter text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? "bg-white" : styles.dot}`}
            />
            <span className="truncate">{status}</span>
          </button>
        );
      })}
    </div>
  );
}
