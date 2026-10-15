import { useEffect, useState, useCallback } from "react";
import api from "../api";

function TypeCard({ type, offices, onChanged, onError }) {
  const [selected, setSelected] = useState(() => new Set(type.offices.map((o) => o._id)));
  const [busy, setBusy] = useState(false);

  const patch = async (body) => {
    onError("");
    setBusy(true);
    try {
      await api.patch(`/clearance-types/${type._id}`, body);
      await onChanged();
    } catch (err) {
      onError(err.response?.data?.message || "Cannot save");
    } finally {
      setBusy(false);
    }
  };

  const toggleOffice = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">{type.name}</p>
          <p className="text-xs text-gray-500">code: {type.code}</p>
          {type.description && <p className="text-sm text-gray-600 mt-1">{type.description}</p>}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${type.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
          {type.active ? "Open to students" : "Switched off"}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <button
          disabled={busy}
          onClick={() => patch({ active: !type.active })}
          className="text-blue-600 hover:underline disabled:opacity-50"
        >
          {type.active ? "Switch off" : "Switch on"}
        </button>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={type.requiresReason}
            disabled={busy}
            onChange={() => patch({ requiresReason: !type.requiresReason })}
          />
          Student must write a reason
        </label>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">Offices required</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {offices.map((o) => (
            <label key={o._id} className="flex items-center gap-2 text-sm border rounded px-2 py-1">
              <input type="checkbox" checked={selected.has(o._id)} onChange={() => toggleOffice(o._id)} />
              <span>
                {o.name} <span className="text-xs text-gray-400">(stage {o.stage})</span>
              </span>
            </label>
          ))}
        </div>
        <button
          disabled={busy}
          onClick={() => patch({ offices: [...selected] })}
          className="mt-2 bg-blue-600 text-white rounded px-3 py-1 text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          Save offices
        </button>
      </div>
    </div>
  );
}

export default function ClearanceTypesTab() {
  const [types, setTypes] = useState([]);
  const [offices, setOffices] = useState([]);
  const [form, setForm] = useState({ name: "", code: "", description: "", requiresReason: false });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [t, o] = await Promise.all([api.get("/clearance-types/all"), api.get("/admin/offices")]);
      setTypes(t.data);
      setOffices(o.data.filter((x) => x.active));
    } catch (err) {
      setError(err.response?.data?.message || "Cannot load clearance types");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/clearance-types", { ...form, active: false });
      setForm({ name: "", code: "", description: "", requiresReason: false });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Cannot create the clearance type");
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      <form onSubmit={create} className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-3">
        <h3 className="font-semibold md:col-span-2">Add a clearance type</h3>
        <input className="border rounded px-3 py-2" placeholder="Name (for example: Transfer Clearance)" value={form.name} onChange={set("name")} required />
        <input className="border rounded px-3 py-2" placeholder="Code (for example: transfer)" value={form.code} onChange={set("code")} required />
        <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Short description (optional)" value={form.description} onChange={set("description")} />
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={form.requiresReason}
            onChange={(e) => setForm({ ...form, requiresReason: e.target.checked })}
          />
          Student must write a reason
        </label>
        <button className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 md:col-span-2">
          Add (starts switched off)
        </button>
      </form>

      {types.map((t) => (
        <TypeCard key={t._id} type={t} offices={offices} onChanged={load} onError={setError} />
      ))}

      <p className="text-xs text-gray-500">
        A new type stays switched off until you choose its offices and switch it on. Changes apply to
        new requests only. These starter office lists are examples, so set them to the university's real policy.
      </p>
    </div>
  );
}
