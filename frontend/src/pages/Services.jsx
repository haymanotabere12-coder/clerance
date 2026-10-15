import { Link } from "react-router-dom";
import { InfoPage } from "../components/PublicLayout";

const SERVICES = [
  { title: "Submit a clearance request", text: "Start a graduation, withdrawal or transfer clearance in one click." },
  { title: "Track in real time", text: "See the status of each office: Pending, Approved or Rejected." },
  { title: "Fix and resubmit", text: "If an office rejects, read the reason, fix the problem and resubmit to that office only." },
  { title: "Digital certificate", text: "Download your clearance certificate as a PDF with a QR code." },
  { title: "Certificate verification", text: "Anyone can check that a certificate is real, with no login." },
  { title: "Office tools", text: "Staff get a queue of pending requests, and administrators get reports and account tools." },
];

export default function Services() {
  return (
    <InfoPage title="Services" subtitle="Everything you can do with the clearance system.">
      <div className="grid sm:grid-cols-2 gap-4">
        {SERVICES.map((s) => (
          <div key={s.title} className="bg-white p-5 rounded-lg shadow">
            <h2 className="font-semibold text-blue-950">{s.title}</h2>
            <p className="text-sm text-gray-700 mt-1">{s.text}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to="/register" className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          Create an account
        </Link>
        <Link to="/verify" className="px-5 py-2 rounded-lg border border-blue-600 text-blue-700 hover:bg-blue-50">
          Verify a certificate
        </Link>
      </div>
    </InfoPage>
  );
}
