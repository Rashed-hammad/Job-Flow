import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, CheckCircle2, XCircle } from "lucide-react";
import { getCvs } from "../api/cv";
import { scoreJobMatch } from "../api/jobs";

const scoreColor = (score) => {
  if (score >= 75) return "text-hunter";
  if (score >= 50) return "text-yellowgreen";
  return "text-brick";
};

export default function MatchScoreModal({ job, token, onClose }) {
  const [cvs, setCvs] = useState([]);
  const [loadingCvs, setLoadingCvs] = useState(true);
  const [selectedCvId, setSelectedCvId] = useState("");
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getCvs(token)
      .then((data) => {
        setCvs(data);
        if (data.length > 0) setSelectedCvId(data[0]._id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingCvs(false));
  }, [token]);

  const handleScore = async () => {
    setError("");
    setScoring(true);
    try {
      const data = await scoreJobMatch(job._id, selectedCvId, token);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setScoring(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Score CV match
            </h2>
            <p className="text-sm text-slate-500">
              {job.role} at {job.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {error && (
            <p className="mb-4 rounded-lg bg-brick/10 px-3.5 py-2.5 text-sm text-brick ring-1 ring-brick/20">
              {error}
            </p>
          )}

          {loadingCvs ? (
            <div className="h-10 animate-pulse rounded-lg bg-champagne/70" />
          ) : cvs.length === 0 ? (
            <p className="text-sm text-slate-500">
              You haven't uploaded a CV yet.{" "}
              <Link
                to="/cvs"
                onClick={onClose}
                className="font-medium text-hunter hover:underline"
              >
                Upload one
              </Link>{" "}
              to score a match.
            </p>
          ) : !result ? (
            <>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                CV to score
              </label>
              <select
                value={selectedCvId}
                onChange={(e) => setSelectedCvId(e.target.value)}
                className="mb-6 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-hunter focus:outline-none focus:ring-4 focus:ring-hunter/10"
              >
                {cvs.map((cv) => (
                  <option key={cv._id} value={cv._id}>
                    {cv.originalName}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleScore}
                disabled={scoring}
                className="w-full rounded-lg bg-hunter px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sage disabled:opacity-50"
              >
                {scoring ? "Scoring..." : "Score match"}
              </button>
            </>
          ) : (
            <div>
              <div className="mb-5 flex items-center gap-4 rounded-xl bg-champagne/30 p-4">
                <div className="shrink-0 text-center">
                  <p
                    className={`text-4xl font-bold ${scoreColor(result.score)}`}
                  >
                    {result.score}
                  </p>
                  <p className="text-xs text-slate-400">out of 100</p>
                </div>
                <p className="text-sm text-slate-600">{result.explanation}</p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {result.strengths.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Strengths
                    </p>
                    <ul className="space-y-1.5">
                      {result.strengths.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 text-sm text-slate-700"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-hunter" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.gaps.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Gaps
                    </p>
                    <ul className="space-y-1.5">
                      {result.gaps.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 text-sm text-slate-700"
                        >
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-brick" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {result && (
          <div className="shrink-0 border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
