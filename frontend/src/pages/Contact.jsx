import { InfoPage } from "../components/PublicLayout";

// Replace these with the real details. Empty values are not shown.
const EMAIL = "registrar@hu.edu.et";
const PHONE = "";
const ADDRESS = "Hawassa University, Hawassa, Ethiopia";
const HOURS = "Monday to Friday, 8:30 AM to 5:00 PM";

export default function Contact() {
  const rows = [
    { label: "Address", value: ADDRESS },
    { label: "Email", value: EMAIL, href: EMAIL ? `mailto:${EMAIL}` : "" },
    { label: "Phone", value: PHONE, href: PHONE ? `tel:${PHONE}` : "" },
    { label: "Office hours", value: HOURS },
  ].filter((r) => r.value);

  return (
    <InfoPage title="Contact" subtitle="Need help with your clearance or your account? Reach the registrar office.">
      <div className="bg-white p-6 rounded-lg shadow space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <p className="text-xs text-gray-500">{r.label}</p>
            {r.href ? (
              <a href={r.href} className="text-blue-700 hover:underline">{r.value}</a>
            ) : (
              <p className="text-gray-800">{r.value}</p>
            )}
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-semibold text-blue-950 mb-2">Forgot your password?</h2>
        <p className="text-sm text-gray-700">
          Contact the registrar office with your university ID, and they will help you reset it.
        </p>
      </div>
    </InfoPage>
  );
}
