import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import api from "../api";

const REASONS = [
  { value: "graduation", label: "Graduation" },
  { value: "withdrawal", label: "Withdrawal" },
  { value: "transfer", label: "Transfer" },
];

const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "");

export default function StudentDashboard() {
  const [requests, setRequests] = useState([]);
  const [detail, setDetail] = useState(null);
  const [reason, setReason] = useState("graduation");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const { data: list } = await api.get("/requests/my");
      setRequests(list);
      if (list.length) {
        const { data } = await api.get(`/requests/${list[0]._id}`);
        setDetail(data);
      } else {
        setDetail(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Cannot load your requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn) => {
    setError("");
    setBusy(true);
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const submitRequest = (e) => {
    e.preventDefault();
    run(() => api.post("/requests", { reason }));
  };

  const resubmit = () => run(() => api.patch(`/requests/${detail.request._id}/resubmit`));

  const download = () =>
    run(async () => {
      const res = await api.get(`/certificates/${detail.request._id}/download`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "clearance-certificate.pdf";
      a.click();
      URL.revokeObjectURL(url);
    });

  const latest = requests[0];
  const active = latest && ["In Progress", "Blocked"].includes(latest.status);

  return (
    <Layout title="Student">
      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && !active && (
        <form onSubmit={submitRequest} className="bg-white p-4 rounded-lg shadow mb-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Start a new clearance request</h2>
          <select
            className="w-full border rounded px-3 py-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            disabled={busy}
            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? "Submitting..." : "Submit request"}
          </button>
        </form>
      )}

      {detail && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900 capitalize">
                Clearance for {detail.request.reason}
              </h2>
              <p className="text-xs text-gray-500">Submitted {fmt(detail.request.submittedAt)}</p>
            </div>
            <StatusBadge status={detail.request.status} />
          </div>

          <ol className="space-y-3">
            {detail.approvals.map((a) => (
              <li key={a._id} className="flex items-start justify-between border rounded p-3">
                <div>
                  <p className="font-medium text-gray-800">{a.office.name}</p>
                  <p className="text-xs text-gray-500">Stage {a.stage}</p>
                  {a.status === "Rejected" && a.reason && (
                    <p className="text-sm text-red-600 mt-1">Reason: {a.reason}</p>
                  )}
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ol>

          <div className="mt-4 flex gap-3">
            {detail.request.status === "Blocked" && (
              <button
                onClick={resubmit}
                disabled={busy}
                className="bg-yellow-500 text-white rounded px-4 py-2 hover:bg-yellow-600 disabled:opacity-50"
              >
                I fixed the problem, resubmit
              </button>
            )}
            {detail.request.status === "Completed" && (
              <button
                onClick={download}
                disabled={busy}
                className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 disabled:opacity-50"
              >
                Download certificate (PDF)
              </button>
            )}
          </div>
        </div>
      )}

      {requests.length > 1 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Previous requests</h3>
          <ul className="space-y-2">
            {requests.slice(1).map((r) => (
              <li key={r._id} className="bg-white border rounded p-3 flex justify-between text-sm">
                <span className="capitalize">
                  {r.reason} - {fmt(r.submittedAt)}
                </span>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  );
}
