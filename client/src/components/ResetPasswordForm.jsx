import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { resetPassword } from "../api/auth";
import Logo from "./Logo";

export default function ResetPasswordForm() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSucceeded(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-champagne/50 via-white to-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-hunter shadow-lg shadow-hunter/30">
            <Logo className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Set a new password
          </h1>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5">
          {succeeded ? (
            <>
              <p className="mb-5 text-sm text-slate-600">
                Password has been reset. You can now log in.
              </p>
              <Link
                to="/login"
                className="block w-full rounded-lg bg-hunter px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sage"
              >
                Go to sign in
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <p className="mb-4 rounded-lg bg-brick/10 px-3.5 py-2.5 text-sm text-brick ring-1 ring-brick/20">
                  {error}
                </p>
              )}

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="mb-4 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-hunter focus:outline-none focus:ring-4 focus:ring-hunter/10"
              />

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="mb-6 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-hunter focus:outline-none focus:ring-4 focus:ring-hunter/10"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-hunter px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sage disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
