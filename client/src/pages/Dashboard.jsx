import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Briefcase, Users, Award } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { getJobStats } from "../api/stats";
import { STATUS_CHART_COLORS } from "../constants/status";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatMonth = (monthStr) => {
  const [year, month] = monthStr.split("-").map(Number);
  return `${MONTH_LABELS[month - 1]} '${String(year).slice(2)}`;
};

const KpiTile = ({ icon: Icon, label, value, caption }) => (
  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
    <div className="mb-2 flex items-center gap-2 text-slate-500">
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
    </div>
    <p className="text-3xl font-bold text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-400">{caption}</p>
  </div>
);

export default function Dashboard() {
  const { token } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getJobStats(token)
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 h-7 w-48 animate-pulse rounded bg-champagne/70" />
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-champagne/70"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-champagne/70"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          A snapshot of your application pipeline.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-brick/10 px-3.5 py-2.5 text-sm text-brick ring-1 ring-brick/20">
          {error}
        </p>
      )}

      {stats && stats.total === 0 ? (
        <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400">
          No applications yet — add one to see your stats
        </div>
      ) : (
        stats && (
          <>
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <KpiTile
                icon={Briefcase}
                label="Total Applications"
                value={stats.total}
                caption="All applications tracked"
              />
              <KpiTile
                icon={Users}
                label="Interview Rate"
                value={`${stats.interviewRate}%`}
                caption="Reached Interview or Offer stage"
              />
              <KpiTile
                icon={Award}
                label="Offer Rate"
                value={`${stats.offerRate}%`}
                caption="Resulted in an Offer"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
                <h2 className="mb-3 text-sm font-semibold text-slate-700">
                  Status breakdown
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={Object.entries(stats.byStatus).map(
                      ([status, count]) => ({ status, count }),
                    )}
                    margin={{ top: 20, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#e1e0d9"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="status"
                      tick={{ fill: "#898781", fontSize: 12 }}
                      axisLine={{ stroke: "#c3c2b7" }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#898781", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.03)" }}
                      formatter={(value) => [value, "Applications"]}
                    />
                    <Bar dataKey="count" maxBarSize={40} radius={[4, 4, 0, 0]}>
                      <LabelList
                        dataKey="count"
                        position="top"
                        fill="#52514e"
                        fontSize={12}
                      />
                      {Object.keys(stats.byStatus).map((status) => (
                        <Cell key={status} fill={STATUS_CHART_COLORS[status]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
                <h2 className="mb-3 text-sm font-semibold text-slate-700">
                  Applications over time
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={stats.monthlyTrend.map((m) => ({
                      ...m,
                      label: formatMonth(m.month),
                    }))}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#e1e0d9"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#898781", fontSize: 12 }}
                      axisLine={{ stroke: "#c3c2b7" }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#898781", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.03)" }}
                      formatter={(value) => [value, "Applications"]}
                    />
                    <Bar
                      dataKey="count"
                      fill="#386641"
                      maxBarSize={32}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )
      )}
    </main>
  );
}
