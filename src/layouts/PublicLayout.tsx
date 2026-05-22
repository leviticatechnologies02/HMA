
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileBottomNav } from "../components/common/MobileBottomNav";
import { useScrollToTop } from "../hooks/useScrollToTop";

export function PublicLayout() {
  useScrollToTop();

  return (
    <>
      <div className="min-h-screen bg-neutral text-dark">

        <Navbar />

        <main className="pt-20 pb-16 md:pb-0">
          <Outlet />
        </main>

        <Footer />
      </div>

      <MobileBottomNav />
    </>
  );
}