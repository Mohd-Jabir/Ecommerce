import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar.jsx";
export default function PublicLayout() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <Navbar/>
      <Outlet />
    </main>
  );
}