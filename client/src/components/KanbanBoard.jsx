import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import KanbanColumn from "./KanbanColumn";
import JobCard from "./JobCard";
import StatusTabs from "./StatusTabs";
import AddJobModal from "./AddJobModal";
import EditJobModal from "./EditJobModal";
import MatchScoreModal from "./MatchScoreModal";
import { getJobs, updateJobStatus, deleteJob } from "../api/jobs";
import { STATUSES } from "../constants/status";

export default function KanbanBoard() {
  const { token } = useOutletContext();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [scoringJob, setScoringJob] = useState(null);
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
    <>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-hunter px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sage sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add job
          </button>
        </div>

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
                      onScore={setScoringJob}
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
                onScore={setScoringJob}
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

      {scoringJob && (
        <MatchScoreModal
          job={scoringJob}
          token={token}
          onClose={() => setScoringJob(null)}
        />
      )}
    </>
  );
}
