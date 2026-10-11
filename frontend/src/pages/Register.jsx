import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth, homeFor } from "../context/AuthContext";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    universityId: "",
    fullName: "",
    email: "",
    phone: "",
    department: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = { ...form };
      if (!body.phone) delete body.phone;
      if (!body.department) delete body.department;
      await api.post("/auth/register", body);
      const user = await login(form.universityId.trim(), form.password);
      navigate(homeFor(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Cannot reach the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white p-6 rounded-lg shadow space-y-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Create a student account</h1>
          <p className="text-sm text-gray-500">Hawassa University</p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

        <input className="w-full border rounded px-3 py-2" placeholder="University ID (UGR/0005/14)" value={form.universityId} onChange={set("universityId")} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Full name" value={form.fullName} onChange={set("fullName")} required />
        <input type="email" className="w-full border rounded px-3 py-2" placeholder="Email" value={form.email} onChange={set("email")} required />
        <input className="w-full border rounded px-3 py-2" placeholder="Phone (optional)" value={form.phone} onChange={set("phone")} />
        <input className="w-full border rounded px-3 py-2" placeholder="Department (optional)" value={form.department} onChange={set("department")} />
        <input type="password" className="w-full border rounded px-3 py-2" placeholder="Password (min 6 characters)" value={form.password} onChange={set("password")} minLength={6} required />

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}
