import { InfoPage } from "../components/PublicLayout";

export default function About() {
  return (
    <InfoPage
      title="About the system"
      subtitle="The Hawassa University Technology Clearance System moves the clearance process from paper to the web."
    >
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-blue-950 mb-2">Why we built it</h2>
        <p className="text-gray-700">
          Clearance used to mean carrying a paper form from office to office, waiting in queues,
          and collecting signatures and stamps. Forms get lost, signatures can be forged, and nobody
          can see where a request is stuck. This system solves those problems.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-blue-950 mb-3">Our goals</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>Let students submit and track clearance and withdrawal requests online.</li>
          <li>Let each office approve or reject with a clear reason.</li>
          <li>Reduce clearance time from days to hours.</li>
          <li>Issue a certificate that cannot be forged and can be verified by anyone.</li>
          <li>Give the university reports about delays and workload.</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-blue-950 mb-2">Who uses it</h2>
        <p className="text-gray-700">
          Students submit requests. Office staff (Library, Cafeteria, Dormitory, Finance, Department
          Head and Registrar) review them. Administrators manage offices and accounts and read the
          reports. Employers and other institutions can verify a certificate without logging in.
        </p>
      </div>
    </InfoPage>
  );
}
