import { useEffect, useState } from "react";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import { Plus, LogOut } from "lucide-react";
import KanbanColumn from "./KanbanColumn";
import JobCard from "./JobCard";
import StatusTabs from "./StatusTabs";
import AddJobModal from "./AddJobModal";
import EditJobModal from "./EditJobModal";
import { getJobs, updateJobStatus, deleteJob } from "../api/jobs";
import { STATUSES } from "../constants/status";

export default function KanbanBoard({ token, onLogout }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [activeStatus, setActiveStatus] = useState(STATUSES[0]);

  useEffect(() => {
    getJobs(token)
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const activeJob = jobs.find((j) => j._id === activeId);

  const changeJobStatus = async (jobId, newStatus) => {
    const job = jobs.find((j) => j._id === jobId);
    if (!job || job.status === newStatus) return;

    const previousJobs = jobs;
    setJobs((prev) =>
      prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j)),
    );

    try {
      await updateJobStatus(jobId, newStatus, token);
    } catch (err) {
      setError(err.message);
      setJobs(previousJobs);
    }
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    changeJobStatus(active.id, over.id);
  };

  const handleDelete = async (jobId) => {
    const previousJobs = jobs;
    setJobs((prev) => prev.filter((j) => j._id !== jobId));

    try {
      await deleteJob(jobId, token);
    } catch (err) {
      setError(err.message);
      setJobs(previousJobs);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-champagne/40 via-white to-white">
      <header className="border-b border-champagne bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Job<span className="text-hunter">Flow</span>
            </h1>
            <p className="hidden text-sm text-slate-500 sm:block">
              Your application pipeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              aria-label="Add job"
              className="flex items-center gap-1.5 rounded-lg bg-hunter px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sage"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add job</span>
            </button>
            <button
              onClick={onLogout}
              aria-label="Log out"
              className="flex items-center gap-1.5 rounded-lg border border-champagne bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-champagne/30"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {error && (
          <p className="mb-4 rounded-lg bg-brick/10 px-3.5 py-2.5 text-sm text-brick ring-1 ring-brick/20">
            {error}
          </p>
        )}

        {loading ? (
          <>
            <div className="hidden gap-4 overflow-x-auto sm:flex">
              {STATUSES.map((s) => (
                <div
                  key={s}
                  className="h-64 min-w-64 flex-1 animate-pulse rounded-2xl bg-champagne/70"
                />
              ))}
            </div>
            <div className="h-64 w-full animate-pulse rounded-2xl bg-champagne/70 sm:hidden" />
          </>
        ) : (
          <>
            <div className="hidden sm:block">
              <DndContext
                collisionDetection={closestCenter}
                onDragStart={({ active }) => setActiveId(active.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex gap-4 overflow-x-auto py-4 px-1">
                  {STATUSES.map((status) => (
                    <KanbanColumn
                      key={status}
                      status={status}
                      jobs={jobs.filter((j) => j.status === status)}
                      onDelete={handleDelete}
                      onEdit={setEditingJob}
                    />
                  ))}
                </div>
                <DragOverlay>
                  {activeJob ? <JobCard job={activeJob} overlay /> : null}
                </DragOverlay>
              </DndContext>
            </div>

            <div className="sm:hidden">
              <StatusTabs
                activeStatus={activeStatus}
                onChange={setActiveStatus}
              />
              <KanbanColumn
                fullWidth
                status={activeStatus}
                jobs={jobs.filter((j) => j.status === activeStatus)}
                onDelete={handleDelete}
                onEdit={setEditingJob}
                onStatusChange={changeJobStatus}
              />
            </div>
          </>
        )}
      </main>

      {showAddModal && (
        <AddJobModal
          token={token}
          onClose={() => setShowAddModal(false)}
          onCreated={(job) => {
            setJobs((prev) => [job, ...prev]);
            setShowAddModal(false);
          }}
        />
      )}

      {editingJob && (
        <EditJobModal
          job={editingJob}
          token={token}
          onClose={() => setEditingJob(null)}
          onUpdated={(updated) => {
            setJobs((prev) =>
              prev.map((j) => (j._id === updated._id ? updated : j)),
            );
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
}
