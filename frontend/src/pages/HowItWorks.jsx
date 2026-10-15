import { InfoPage } from "../components/PublicLayout";

const STEPS = [
  { title: "Log in or create an account", text: "Use your university ID. Staff and administrators receive their accounts from the university." },
  { title: "Submit your request", text: "Choose the reason (graduation, withdrawal or transfer) and submit." },
  { title: "Offices review it", text: "Your request goes to the offices in order. You can follow every office on your dashboard." },
  { title: "Fix any rejection", text: "If an office rejects, read the reason, solve it, and resubmit to that office." },
  { title: "Download your certificate", text: "When every office approves, download your PDF certificate with its QR code." },
];

const STAGES = [
  { stage: "Stage 1 (at the same time)", offices: "Library, Cafeteria, Dormitory, Finance" },
  { stage: "Stage 2", offices: "Department Head" },
  { stage: "Stage 3", offices: "Registrar" },
];

export default function HowItWorks() {
  return (
    <InfoPage title="How it works" subtitle="Five simple steps from request to certificate.">
      <ol className="space-y-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="bg-white p-4 rounded-lg shadow flex gap-4">
            <span className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <div>
              <p className="font-semibold text-blue-950">{s.title}</p>
              <p className="text-sm text-gray-700">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="bg-white p-5 rounded-lg shadow">
        <h2 className="font-semibold text-blue-950 mb-3">Approval order</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          {STAGES.map((s) => (
            <li key={s.stage}>
              <span className="font-medium">{s.stage}:</span> {s.offices}
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          An office in the next stage sees your request only after the previous stage approves.
        </p>
      </div>
    </InfoPage>
  );
}
