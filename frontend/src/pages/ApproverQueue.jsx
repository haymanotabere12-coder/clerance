import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import api from "../api";

const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "");

export default function ApproverQueue() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/approvals/queue");
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || "Cannot load the queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id, action, body) => {
    setError("");
    setBusyId(id);
    try {
      await api.patch(`/approvals/${id}/${action}`, body);
      setRejectingId(null);
      setReason("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Layout title="Office Approver">
      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && items.length === 0 && (
        <p className="bg-white p-4 rounded-lg shadow text-gray-600">No pending requests.</p>
      )}

      <ul className="space-y-3">
        {items.map((a) => {
          const student = a.request?.student;
          return (
            <li key={a._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{student?.fullName}</p>
                  <p className="text-sm text-gray-600">
                    {student?.universityId}
                    {student?.department ? ` - ${student.department}` : ""}
                  </p>
                  <p className="text-xs text-gray-500 capitalize mt-1">
                    {a.request?.reason} - submitted {fmt(a.request?.submittedAt)}
                  </p>
                </div>
              </div>

              {rejectingId === a._id ? (
                <div className="mt-3 space-y-2">
                  <input
                    className="w-full border rounded px-3 py-2"
                    placeholder="Reason for rejection (for example: unreturned book)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={busyId === a._id || reason.trim().length < 3}
                      onClick={() => act(a._id, "reject", { reason: reason.trim() })}
                      className="bg-red-600 text-white rounded px-4 py-2 hover:bg-red-700 disabled:opacity-50"
                    >
                      Confirm reject
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(null);
                        setReason("");
                      }}
                      className="border rounded px-4 py-2 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <button
                    disabled={busyId === a._id}
                    onClick={() => act(a._id, "approve")}
                    className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    disabled={busyId === a._id}
                    onClick={() => setRejectingId(a._id)}
                    className="border border-red-300 text-red-700 rounded px-4 py-2 hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Layout>
  );
}
