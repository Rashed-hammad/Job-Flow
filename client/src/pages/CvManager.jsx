import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Upload, FileText, Download, Trash2 } from "lucide-react";
import { getCvs, uploadCv, deleteCv, downloadCv } from "../api/cv";
import ConfirmDialog from "../components/ConfirmDialog";

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function CvManager() {
  const { token } = useOutletContext();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getCvs(token)
      .then(setCvs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const cv = await uploadCv(file, token);
      setCvs((prev) => [cv, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (cv) => {
    setError("");
    try {
      const blob = await downloadCv(cv._id, token);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = cv.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (cvId) => {
    const previousCvs = cvs;
    setCvs((prev) => prev.filter((c) => c._id !== cvId));

    try {
      await deleteCv(cvId, token);
    } catch (err) {
      setError(err.message);
      setCvs(previousCvs);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          My CVs
        </h1>
        <p className="text-sm text-slate-500">
          Upload PDF versions of your CV to use for future match scoring.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-brick/10 px-3.5 py-2.5 text-sm text-brick ring-1 ring-brick/20">
          {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="mb-6 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-champagne bg-champagne/20 px-4 py-8 text-center transition-colors hover:bg-champagne/30 disabled:opacity-50"
      >
        <Upload className="h-6 w-6 text-hunter" />
        <span className="text-sm font-medium text-slate-700">
          {uploading ? "Uploading..." : "Click to upload a PDF"}
        </span>
        <span className="text-xs text-slate-400">Max 5MB</span>
      </button>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-champagne/70"
            />
          ))}
        </div>
      ) : cvs.length === 0 ? (
        <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400">
          No CVs uploaded yet
        </div>
      ) : (
        <div className="space-y-3">
          {cvs.map((cv) => (
            <div
              key={cv._id}
              className="flex items-center gap-3 rounded-xl border-l-4 border-l-hunter bg-white p-3.5 shadow-sm ring-1 ring-slate-900/5"
            >
              <FileText className="h-8 w-8 shrink-0 text-hunter" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-800">
                  {cv.originalName}
                </p>
                <p className="text-xs text-slate-400">
                  {formatSize(cv.size)} · Uploaded {formatDate(cv.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDownload(cv)}
                aria-label="Download CV"
                className="rounded p-1.5 text-slate-300 hover:bg-hunter/10 hover:text-hunter"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmTarget(cv)}
                aria-label="Delete CV"
                className="rounded p-1.5 text-slate-300 hover:bg-brick/10 hover:text-brick"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {confirmTarget && (
        <ConfirmDialog
          title="Delete CV"
          message={`Are you sure you want to delete "${confirmTarget.originalName}"? This can't be undone.`}
          confirmLabel="Delete"
          onCancel={() => setConfirmTarget(null)}
          onConfirm={() => {
            handleDelete(confirmTarget._id);
            setConfirmTarget(null);
          }}
        />
      )}
    </main>
  );
}
