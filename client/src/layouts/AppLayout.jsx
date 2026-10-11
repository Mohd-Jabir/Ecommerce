import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar.jsx";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <Outlet />
    </div>
  );
}
