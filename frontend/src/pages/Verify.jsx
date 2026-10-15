import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function Verify() {
  const { serial } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!serial) {
      setResult(null);
      setError("");
      return;
    }
    setLoading(true);
    setResult(null);
    setError("");
    api
      .get(`/verify/${encodeURIComponent(serial)}`)
      .then((res) => setResult(res.data))
      .catch((err) => {
        if (err.response?.status === 404) setError("Certificate not found. It may be fake.");
        else setError("Cannot reach the server. Try again later.");
      })
      .finally(() => setLoading(false));
  }, [serial]);

  const submit = (e) => {
    e.preventDefault();
    if (input.trim()) navigate(`/verify/${encodeURIComponent(input.trim())}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Verify a clearance certificate</h1>
          <p className="text-sm text-gray-500">Hawassa University</p>
        </div>

        <form onSubmit={submit} className="flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="Serial number, for example HU-2026-000001"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">Check</button>
        </form>

        {loading && <p className="text-gray-500">Checking...</p>}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="font-semibold text-red-700">Not valid</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && result.valid && (
          <div className="bg-green-50 border border-green-200 rounded p-4 space-y-1">
            <p className="font-semibold text-green-700">Valid certificate</p>
            <p className="text-sm"><span className="text-gray-500">Name:</span> {result.studentName}</p>
            {result.clearanceType && (
              <p className="text-sm"><span className="text-gray-500">Clearance type:</span> {result.clearanceType}</p>
            )}
            <p className="text-sm"><span className="text-gray-500">Serial:</span> {result.serialNumber}</p>
            <p className="text-sm">
              <span className="text-gray-500">Issued:</span> {new Date(result.issuedAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {result && !result.valid && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="font-semibold text-red-700">Certificate has been altered</p>
            <p className="text-sm text-red-600">The data does not match the original. Do not accept it.</p>
          </div>
        )}
      </div>
    </div>
  );
}
