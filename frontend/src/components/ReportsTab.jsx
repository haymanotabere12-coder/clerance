import { useEffect, useState } from "react";
import api from "../api";

export default function ReportsTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/reports")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Cannot load reports"));
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p className="text-gray-500">Loading...</p>;

  const total = data.byStatus.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-500">Total requests</p>
          <p className="text-2xl font-semibold">{total}</p>
        </div>
        {data.byStatus.map((s) => (
          <div key={s.status} className="bg-white p-4 rounded-lg shadow">
            <p className="text-xs text-gray-500">{s.status}</p>
            <p className="text-2xl font-semibold">{s.count}</p>
          </div>
        ))}
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-500">Avg completion (hours)</p>
          <p className="text-2xl font-semibold">{data.avgCompletionHours ?? "-"}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <h3 className="font-semibold mb-3">Workload per office</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Office</th>
              <th>Stage</th>
              <th>Pending</th>
              <th>Approved</th>
              <th>Rejected</th>
            </tr>
          </thead>
          <tbody>
            {data.perOffice.map((o) => (
              <tr key={o.office} className="border-b last:border-0">
                <td className="py-2">{o.office}</td>
                <td>{o.stage}</td>
                <td>{o.pending}</td>
                <td>{o.approved}</td>
                <td>{o.rejected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-3">Current rejection reasons</h3>
        {data.topRejectionReasons.length === 0 ? (
          <p className="text-sm text-gray-500">No rejected requests right now.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {data.topRejectionReasons.map((r) => (
              <li key={r.reason} className="flex justify-between">
                <span>{r.reason}</span>
                <span className="font-medium">{r.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
