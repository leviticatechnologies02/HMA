
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileBottomNav } from "../components/common/MobileBottomNav";
import { useScrollToTop } from "../hooks/useScrollToTop";

const PUBLIC_TITLES: Record<string, string> = {
  "/": "Home",
  "/hostels": "Find Hostels",
  "/hostels/map": "Hostels Map",
  "/calculator": "Rent Calculator",
  "/aboutus": "About Us",
  "/contact": "Contact",
  "/terms": "Terms of Service",
  "/privacy": "Privacy Policy",
  "/help": "Help Center",
  "/register-hostel": "Register Hostel",
  "/booking/select": "Select Booking",
  "/booking/details": "Booking Details",
  "/booking/checkout": "Checkout",
  "/booking/confirmation": "Booking Confirmation",
  "/my-bookings": "My Bookings",
  "/profile": "My Profile",
  "/login": "Login",
  "/register": "Sign Up",
  "/auth/login": "Login",
  "/auth/register": "Sign Up",
  "/forgot-password": "Forgot Password",
  "/auth/forgot-password": "Forgot Password",
  "/reset-password": "Reset Password",
  "/auth/reset-password": "Reset Password",
};

export function PublicLayout() {
  const location = useLocation();
  useScrollToTop();

  useEffect(() => {
    let title = PUBLIC_TITLES[location.pathname];
    if (!title) {
      if (location.pathname.startsWith("/hostels/")) title = "Hostel Details";
      else title = "Levitica Nestora";
    }
    document.title = title === "Levitica Nestora" ? title : `${title} | Levitica Nestora`;
  }, [location.pathname]);

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