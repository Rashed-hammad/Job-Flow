import { useState } from "react";
import { Link } from "react-router-dom";
import { register } from "../api/auth";
import Logo from "./Logo";

export default function RegisterForm({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const data = await register(name, email, password);
      onRegister(data);
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
            Create your Job<span className="text-hunter">Flow</span> account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Start tracking your applications
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5"
        >
          {error && (
            <p className="mb-4 rounded-lg bg-brick/10 px-3.5 py-2.5 text-sm text-brick ring-1 ring-brick/20">
              {error}
            </p>
          )}

          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Jane Doe"
            className="mb-4 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-hunter focus:outline-none focus:ring-4 focus:ring-hunter/10"
          />

          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="mb-4 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-hunter focus:outline-none focus:ring-4 focus:ring-hunter/10"
          />

          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
            className="mb-4 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-hunter focus:outline-none focus:ring-4 focus:ring-hunter/10"
          />

          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Verify password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
            className="mb-6 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-hunter focus:outline-none focus:ring-4 focus:ring-hunter/10"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-hunter px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sage disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-hunter hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
