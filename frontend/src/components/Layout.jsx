import { useAuth } from "../context/AuthContext";

export default function Layout({ title, children }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-gray-900">Hawassa University Clearance</h1>
          <p className="text-xs text-gray-500">{title}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">{user?.fullName}</span>
          <button
            onClick={logout}
            className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4">{children}</main>
    </div>
  );
}
