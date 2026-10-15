import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, homeFor } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import StudentDashboard from "./pages/StudentDashboard";
import ApproverQueue from "./pages/ApproverQueue";
import AdminDashboard from "./pages/AdminDashboard";

function Fallback() {
  const { user } = useAuth();
  return <Navigate to={user ? homeFor(user.role) : "/"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/verify/:serial" element={<Verify />} />
          <Route path="/student" element={<ProtectedRoute roles={["student"]}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/approver" element={<ProtectedRoute roles={["approver"]}><ApproverQueue /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Fallback />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
