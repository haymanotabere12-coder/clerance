const COLORS = {
  Approved: "bg-green-100 text-green-800",
  Completed: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Rejected: "bg-red-100 text-red-800",
  Blocked: "bg-red-100 text-red-800",
  Waiting: "bg-gray-100 text-gray-600",
  Cancelled: "bg-gray-100 text-gray-600",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${COLORS[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}
