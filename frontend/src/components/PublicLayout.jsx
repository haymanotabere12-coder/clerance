import { Link, NavLink } from "react-router-dom";

export function Logo({ size = "h-14 w-14" }) {
  return (
    <img
      src="/logo.png"
      alt=""
      className={`${size} rounded-full`}
      onError={(e) => (e.currentTarget.style.display = "none")}
    />
  );
}

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/contact", label: "Contact" },
];

const linkClass = ({ isActive }) =>
  `text-sm pb-1 border-b-2 whitespace-nowrap ${
    isActive
      ? "font-medium text-blue-700 border-blue-600"
      : "text-gray-700 border-transparent hover:text-blue-700"
  }`;

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white">
        <div className="px-4 md:px-10 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <Logo />
            <div className="border-l pl-3">
              <p className="font-bold text-lg text-blue-900 leading-tight">Hawassa University</p>
              <p className="text-sm text-gray-600">Technology Clearance System</p>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-6">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 rounded-lg border border-blue-600 text-blue-700 text-sm hover:bg-blue-50">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">
              Register
            </Link>
          </div>
        </div>
        <nav className="flex lg:hidden gap-5 overflow-x-auto px-4 pb-2">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="flex-1 flex flex-col">{children}</div>

      <footer className="bg-blue-950 text-blue-100 px-4 md:px-10 py-6 flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-3">
          <Logo size="h-10 w-10" />
          <div>
            <p className="font-semibold text-white">Hawassa University</p>
            <p>Technology Clearance System</p>
          </div>
        </div>
        <p>Hawassa, Ethiopia &middot; &copy; {new Date().getFullYear()} Hawassa University. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/verify" className="hover:underline">Verify a certificate</Link>
          <Link to="/contact" className="hover:underline">Help</Link>
        </div>
      </footer>
    </div>
  );
}

export function InfoPage({ title, subtitle, children }) {
  return (
    <PublicLayout>
      <section className="bg-blue-900 text-white px-4 md:px-10 py-10">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="mt-2 text-blue-100 max-w-2xl">{subtitle}</p>}
      </section>
      <section className="flex-1 bg-gray-50 px-4 md:px-10 py-8">
        <div className="max-w-4xl mx-auto space-y-6">{children}</div>
      </section>
    </PublicLayout>
  );
}
