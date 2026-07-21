import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import Logo from "./Logo";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
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
            Reset your password
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            We'll email you a link to reset it
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5">
          {submitted ? (
            <p className="text-sm text-slate-600">
              If that email is registered, check your inbox for a reset link.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <p className="mb-4 rounded-lg bg-brick/10 px-3.5 py-2.5 text-sm text-brick ring-1 ring-brick/20">
                  {error}
                </p>
              )}

              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="mb-6 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-hunter focus:outline-none focus:ring-4 focus:ring-hunter/10"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-hunter px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sage disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-slate-500">
            <Link to="/login" className="font-medium text-hunter hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
