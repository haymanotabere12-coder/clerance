import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, homeFor } from "../context/AuthContext";
import PublicLayout, { Logo } from "../components/PublicLayout";

const ICONS = {
  shield: "M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z",
  lock: "M12 1a5 5 0 00-5 5v3H5v13h14V9h-2V6a5 5 0 00-5-5zm0 2a3 3 0 013 3v3H9V6a3 3 0 013-3z",
  doc: "M6 2h9l5 5v15H6V2z",
};

function Icon({ name }) {
  return (
    <span className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
        <path d={ICONS[name]} />
      </svg>
    </span>
  );
}

const FEATURES = [
  { icon: "shield", title: "Track Requests", text: "Check the status of your requests in real-time." },
  { icon: "lock", title: "Secure Access", text: "Your data is safe and protected." },
  { icon: "doc", title: "Digital Clearance", text: "Get your clearance certificate online." },
];

export default function Home() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [universityId, setUniversityId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={homeFor(user.role)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await login(universityId.trim(), password);
      navigate(homeFor(u.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Cannot reach the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <section
        className="flex-1 px-4 md:px-10 py-10 grid lg:grid-cols-2 gap-8 items-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(8,47,130,.88), rgba(8,47,130,.35)), url(/campus.jpg), linear-gradient(135deg,#0b3a9e,#1d6fe0)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="text-white">
          <p className="tracking-widest text-sm mb-2">HAWASSA UNIVERSITY</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Technology Clearance <span className="text-sky-300">System</span>
          </h1>
          <p className="mt-4 max-w-md text-blue-50">
            Manage your clearance and withdrawal requests easily, quickly and securely online.
            Hawassa University Technology Department.
          </p>
          <div className="mt-8 grid sm:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col gap-2">
                <Icon name={f.icon} />
                <p className="font-semibold">{f.title}</p>
                <p className="text-sm text-blue-100">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={submit}
          className="w-full max-w-md justify-self-center lg:justify-self-end bg-white/95 rounded-2xl shadow-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <Logo size="h-12 w-12" />
            <div>
              <p className="font-bold text-blue-900">Hawassa University</p>
              <p className="text-sm text-gray-600">Technology Clearance System</p>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-blue-950">Welcome Back</h2>
            <p className="text-sm text-gray-600">Login to your account to access your clearance and withdrawal requests.</p>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">University ID</label>
            <input
              className="w-full border rounded-lg px-3 py-3 bg-white"
              placeholder="e.g. UGR/0001/14"
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                className="w-full border rounded-lg px-3 py-3 pr-16 bg-white"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-800"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
            <Link to="/contact" className="block text-right mt-1 text-sm text-blue-700 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-700 text-white rounded-lg py-3 font-semibold hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login  \u2192"}
          </button>
          <p className="text-center text-sm text-gray-700">
            New student? <Link to="/register" className="text-blue-700 font-semibold hover:underline">Create an account</Link>
          </p>
        </form>
      </section>
    </PublicLayout>
  );
}
