import { useState } from "react";
import Layout from "../components/Layout";
import ReportsTab from "../components/ReportsTab";
import OfficesTab from "../components/OfficesTab";
import UsersTab from "../components/UsersTab";

const TABS = [
  { id: "reports", label: "Reports" },
  { id: "offices", label: "Offices" },
  { id: "users", label: "Users" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("reports");
  return (
    <Layout title="Admin">
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded text-sm ${
              tab === t.id ? "bg-blue-600 text-white" : "bg-white border hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "reports" && <ReportsTab />}
      {tab === "offices" && <OfficesTab />}
      {tab === "users" && <UsersTab />}
    </Layout>
  );
}
