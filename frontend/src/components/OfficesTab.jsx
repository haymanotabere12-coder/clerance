import { useEffect, useState, useCallback } from "react";
import api from "../api";

export default function OfficesTab() {
  const [offices, setOffices] = useState([]);
  const [name, setName] = useState("");
  const [stage, setStage] = useState(1);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/offices");
      setOffices(data);
    } catch (err) {
      setError(err.response?.data?.message || "Cannot load offices");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/admin/offices", { name, stage: Number(stage) });
      setName("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Cannot add the office");
    }
  };

  const toggle = async (o) => {
    setError("");
    try {
      await api.patch(`/admin/offices/${o._id}`, { active: !o.active });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Cannot update the office");
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      <form onSubmit={add} className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Office name</label>
          <input
            className="border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Stage</label>
          <input
            type="number"
            min="1"
            className="border rounded px-3 py-2 w-24"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            required
          />
        </div>
        <button className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">
          Add office
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="p-3">Office</th>
              <th>Stage</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {offices.map((o) => (
              <tr key={o._id} className="border-b last:border-0">
                <td className="p-3">{o.name}</td>
                <td>{o.stage}</td>
                <td>{o.active ? "Active" : "Disabled"}</td>
                <td>
                  <button onClick={() => toggle(o)} className="text-blue-600 hover:underline">
                    {o.active ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">
        Offices with the same stage run in parallel. Changes apply to new requests only.
      </p>
    </div>
  );
}
