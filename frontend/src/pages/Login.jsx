import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, homeFor } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [universityId, setUniversityId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(universityId.trim(), password);
      navigate(homeFor(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Cannot reach the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Clearance System</h1>
          <p className="text-sm text-gray-500">Hawassa University</p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

        <div>
          <label className="block text-sm text-gray-700 mb-1">University ID</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={universityId}
            onChange={(e) => setUniversityId(e.target.value)}
            placeholder="UGR/0001/14"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-sm text-center text-gray-600">New student? <Link to="/register" className="text-blue-600 hover:underline">Create an account</Link></p>
      </form>
    </div>
  );
}

