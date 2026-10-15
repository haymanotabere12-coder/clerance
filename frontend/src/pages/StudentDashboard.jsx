import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import api from "../api";
import { downloadFile } from "../downloadFile";

const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "");

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];

const titleOf = (r) =>
  r.clearanceType?.name || (r.reason ? `Clearance for ${r.reason}` : "Clearance");

const sizeText = (n) =>
  n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;

export default function StudentDashboard() {
  const [requests, setRequests] = useState([]);
  const [types, setTypes] = useState([]);
  const [detail, setDetail] = useState(null);
  const [typeId, setTypeId] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [list, t] = await Promise.all([api.get("/requests/my"), api.get("/clearance-types")]);
      setRequests(list.data);
      setTypes(t.data);
      setTypeId((current) => current || t.data[0]?._id || "");
      if (list.data.length) {
        const { data } = await api.get(`/requests/${list.data[0]._id}`);
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

  const selected = types.find((t) => t._id === typeId);

  const pickFile = (e) => {
    const picked = e.target.files[0];
    setError("");
    if (!picked) {
      setFile(null);
      return;
    }
    if (!ALLOWED.includes(picked.type)) {
      setError("Only PDF, JPG or PNG files are allowed");
      e.target.value = "";
      setFile(null);
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError("File is too large (maximum 2 MB)");
      e.target.value = "";
      setFile(null);
      return;
    }
    setFile(picked);
  };

  const clearFile = () => {
    setFile(null);
    setFileKey((k) => k + 1);
  };

  const submitRequest = (e) => {
    e.preventDefault();
    run(async () => {
      const fd = new FormData();
      fd.append("clearanceTypeId", typeId);
      fd.append("reason", reason.trim());
      if (selected?.requiresReason && file) fd.append("document", file);
      await api.post("/requests", fd);
      setReason("");
      clearFile();
    });
  };

  const resubmit = () => run(() => api.patch(`/requests/${detail.request._id}/resubmit`));

  const downloadCertificate = () =>
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

  const openFile = async (a) => {
    setError("");
    try {
      await downloadFile(a);
    } catch {
      setError("Cannot download the file");
    }
  };

  const latest = requests[0];
  const active = latest && ["In Progress", "Blocked"].includes(latest.status);

  return (
    <Layout title="Student">
      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && !active && (
        <form onSubmit={submitRequest} className="bg-white p-4 rounded-lg shadow mb-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Start a new clearance request</h2>

          {types.length === 0 ? (
            <p className="text-sm text-gray-600">
              No clearance types are open right now. Please contact the administrator.
            </p>
          ) : (
            <>
              <select
                className="w-full border rounded px-3 py-2"
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
              >
                {types.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>

              {selected?.description && <p className="text-sm text-gray-600">{selected.description}</p>}

              {selected?.offices?.length > 0 && (
                <p className="text-xs text-gray-500">
                  Offices that will review it: {selected.offices.map((o) => o.name).join(", ")}
                </p>
              )}

              {selected?.requiresReason && (
                <>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Reason (required)</label>
                    <textarea
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                      maxLength={500}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Explain why you are requesting this clearance"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Supporting document or photo (optional)
                    </label>
                    <input
                      key={fileKey}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={pickFile}
                      className="block w-full text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG or PNG, up to 2 MB.</p>
                    {file && (
                      <p className="text-sm text-gray-700 mt-1">
                        Selected: {file.name} ({sizeText(file.size)}){" "}
                        <button type="button" onClick={clearFile} className="text-red-600 hover:underline">
                          Remove
                        </button>
                      </p>
                    )}
                  </div>
                </>
              )}

              <button
                disabled={busy || !typeId}
                className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
              >
                {busy ? "Submitting..." : "Submit request"}
              </button>
            </>
          )}
        </form>
      )}

      {detail && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">{titleOf(detail.request)}</h2>
              <p className="text-xs text-gray-500">Submitted {fmt(detail.request.submittedAt)}</p>
              {detail.request.clearanceType && detail.request.reason && (
                <p className="text-sm text-gray-600 mt-1">Reason: {detail.request.reason}</p>
              )}
            </div>
            <StatusBadge status={detail.request.status} />
          </div>

          {detail.attachments?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Supporting document</p>
              {detail.attachments.map((a) => (
                <button
                  key={a._id}
                  onClick={() => openFile(a)}
                  className="text-sm text-blue-600 hover:underline mr-3"
                >
                  {a.originalName} ({sizeText(a.size)})
                </button>
              ))}
            </div>
          )}

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
                onClick={downloadCertificate}
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
                <span>
                  {titleOf(r)} - {fmt(r.submittedAt)}
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
