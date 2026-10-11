import { useEffect, useState, useCallback } from "react";
import api from "../api";

const parseCsv = (text) => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row = {};
    headers.forEach((h, i) => {
      if (cells[i]) row[h] = cells[i];
    });
    return row;
  });
};

const emptyForm = {
  universityId: "",
  fullName: "",
  email: "",
  password: "",
  role: "student",
  department: "",
  office: "",
};

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [offices, setOffices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [importResult, setImportResult] = useState(null);

  const load = useCallback(async () => {
    try {
      const [u, o] = await Promise.all([api.get("/admin/users"), api.get("/admin/offices")]);
      setUsers(u.data);
      setOffices(o.data);
    } catch (err) {
      setError(err.response?.data?.message || "Cannot load users");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const body = { ...form };
      if (!body.department) delete body.department;
      if (body.role !== "approver") delete body.office;
      await api.post("/admin/users", body);
      setMessage(`User ${form.universityId} created`);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Cannot create the user");
    }
  };

  const importCsv = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setImportResult(null);
    try {
      const students = parseCsv(await file.text());
      if (!students.length) {
        setError("The CSV file has no rows");
        return;
      }
      const { data } = await api.post("/admin/import-students", { students });
      setImportResult(data);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Import failed");
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
      {message && <p className="text-sm text-green-700 bg-green-50 p-2 rounded">{message}</p>}

      <form onSubmit={create} className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-3">
        <h3 className="font-semibold md:col-span-2">Create a user</h3>
        <input className="border rounded px-3 py-2" placeholder="University ID" value={form.universityId} onChange={set("universityId")} required />
        <input className="border rounded px-3 py-2" placeholder="Full name" value={form.fullName} onChange={set("fullName")} required />
        <input type="email" className="border rounded px-3 py-2" placeholder="Email" value={form.email} onChange={set("email")} required />
        <input type="password" className="border rounded px-3 py-2" placeholder="Password (min 6)" value={form.password} onChange={set("password")} required />
        <select className="border rounded px-3 py-2" value={form.role} onChange={set("role")}>
          <option value="student">Student</option>
          <option value="approver">Approver</option>
          <option value="admin">Admin</option>
        </select>
        {form.role === "approver" ? (
          <select className="border rounded px-3 py-2" value={form.office} onChange={set("office")} required>
            <option value="">Choose office</option>
            {offices.map((o) => (
              <option key={o._id} value={o._id}>{o.name}</option>
            ))}
          </select>
        ) : (
          <input className="border rounded px-3 py-2" placeholder="Department (optional)" value={form.department} onChange={set("department")} />
        )}
        <button className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 md:col-span-2">
          Create user
        </button>
      </form>

      <div className="bg-white p-4 rounded-lg shadow space-y-2">
        <h3 className="font-semibold">Import students from CSV</h3>
        <p className="text-xs text-gray-500">
          Columns: universityId, fullName, email, phone, department. Do not use commas inside a value.
          Each student's first password is their university ID.
        </p>
        <input type="file" accept=".csv" onChange={importCsv} />
        {importResult && (
          <div className="text-sm">
            <p className="text-green-700">Created: {importResult.created}</p>
            <p className="text-red-600">Failed: {importResult.failedCount}</p>
            {importResult.failed.map((f, i) => (
              <p key={i} className="text-xs text-gray-600">
                {f.universityId}: {f.error}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="p-3">University ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Office</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b last:border-0">
                <td className="p-3">{u.universityId}</td>
                <td>{u.fullName}</td>
                <td className="capitalize">{u.role}</td>
                <td>{u.office?.name || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
