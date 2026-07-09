import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { DashboardLayout } from "../layouts/DashboardLayout";
import { AdminAttendancePage } from "../pages/admin/AdminAttendancePage";
import { AdminBookingsPage } from "../pages/admin/AdminBookingsPage";
import { PublicLayout } from "../layouts/PublicLayout";
import { AdminComplaintsPage } from "../pages/admin/AdminComplaintsPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminHostelProfilePage } from "../pages/admin/AdminHostelProfilePage";
import { AdminInventoryPage } from "../pages/admin/AdminInventoryPage";
import { AdminMessMenuPage } from "../pages/admin/AdminMessMenuPage";
import { AdminMyHostelsPage } from "../pages/admin/AdminMyHostelsPage";
import { AdminNoticesPage } from "../pages/admin/AdminNoticesPage";
import { AdminPaymentsPage } from "../pages/admin/AdminPaymentsPage";
import { AdminSupervisorsPage } from "../pages/admin/AdminSupervisorsPage";
import { AdminStudentsPage } from "../pages/admin/AdminStudentsPage";
import { AdminMaintenancePage } from "../pages/admin/AdminMaintenancePage";
import { AdminReportsPage } from "../pages/admin/AdminReportsPage";
import { AdminSettingsPage } from "../pages/admin/AdminSettingsPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { OTPVerifyPage } from "../pages/auth/OTPVerifyPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { VisitorProfilePage } from "../pages/auth/VisitorProfilePage";
import { ForbiddenPage } from "../pages/auth/ForbiddenPage";
import { MyBookingsPage } from "../pages/booking/MyBookingsPage";
import { BookingSelectPage } from "../pages/booking/BookingSelectPage";
import { BookingDetailsPage } from "../pages/booking/BookingDetailsPage";
import { BookingCheckoutPage } from "../pages/booking/BookingCheckoutPage";
import { BookingConfirmationPage } from "../pages/booking/BookingConfirmationPage";
import { PublicHostelDetailPage } from "../pages/public/PublicHostelDetailPage";
import { PublicHostelListPage } from "../pages/public/PublicHostelListPage";
import { PublicLandingPage } from "../pages/public/PublicLandingPage";
import { RentCalculatorPage } from "../pages/public/RentCalculatorPage";
import { PublicHostelMapPage } from "../pages/public/PublicHostelMapPage";
import Aboutus from "../pages/public/AboutusPage";
import Contact from "../pages/public/ContactPage";
import TermsOfService from "../pages/public/TermsOfServicePage";
import PrivacyPolicy from "../pages/public/PrivacyPolicyPage";
import HelpCenter from "../pages/public/HelpCenterPage";
import { RegisterHostelPage } from "../pages/public/RegisterHostelPage";
import { SuperAdminAdminsPage } from "../pages/superAdmin/SuperAdminAdminsPage";
import { SuperAdminDashboardPage } from "../pages/superAdmin/SuperAdminDashboardPage";
import { SuperAdminHostelsPage } from "../pages/superAdmin/SuperAdminHostelsPage";
import { SuperAdminSubscriptionsPage } from "../pages/superAdmin/SuperAdminSubscriptionsPage";
import { SuperAdminPlansPage } from "../pages/superAdmin/SuperAdminPlansPage";
import { SuperAdminReportsPage } from "../pages/superAdmin/SuperAdminReportsPage";
import { SuperAdminSettingsPage } from "../pages/superAdmin/SuperAdminSettingsPage";
import { SupervisorAttendancePage } from "../pages/supervisor/SupervisorAttendancePage";
import { SupervisorComplaintsPage } from "../pages/supervisor/SupervisorComplaintsPage";
import { SupervisorDashboardPage } from "../pages/supervisor/SupervisorDashboardPage";
import { SupervisorMaintenancePage } from "../pages/supervisor/SupervisorMaintenancePage";
import { SupervisorNoticesPage } from "../pages/supervisor/SupervisorNoticesPage";
import { SupervisorStudentsPage } from "../pages/supervisor/SupervisorStudentsPage";
import { SupervisorMessMenuPage } from "../pages/supervisor/SupervisorMessMenuPage";
import { SupervisorSettingsPage } from "../pages/supervisor/SupervisorSettingsPage";
import { StudentDashboardPage } from "../pages/student/StudentDashboardPage";
import { StudentAttendancePage } from "../pages/student/StudentAttendancePage";
import { StudentBookingsPage } from "../pages/student/StudentBookingsPage";
import { StudentComplaintsPage } from "../pages/student/StudentComplaintsPage";
import { StudentNoticesPage } from "../pages/student/StudentNoticesPage";
import { StudentPaymentsPage } from "../pages/student/StudentPaymentsPage";
import { StudentProfilePage } from "../pages/student/StudentProfilePage";
import { StudentMessMenuPage } from "../pages/student/StudentMessMenuPage";
import { StudentWaitlistPage } from "../pages/student/StudentWaitlistPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { SunsetIcon } from "lucide-react";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicLandingPage />} />
          <Route path="/hostels" element={<PublicHostelListPage />} />
          <Route path="/hostels/map" element={<PublicHostelMapPage />} />
          <Route path="/hostels/:slug" element={<PublicHostelDetailPage />} />
          <Route path="/calculator" element={<RentCalculatorPage />} />
          <Route path="/aboutus" element={<Aboutus />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/register-hostel" element={<RegisterHostelPage />} />
          <Route path="/booking" element={<Navigate to="/hostels" replace />} />
          <Route path="/booking/select" element={<BookingSelectPage />} />
          <Route path="/booking/details" element={<BookingDetailsPage />} />
          <Route path="/booking/checkout" element={<BookingCheckoutPage />} />
          <Route path="/booking/confirmation" element={<BookingConfirmationPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/profile" element={<VisitorProfilePage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/verify-otp" element={<OTPVerifyPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/super-admin/dashboard" element={<SuperAdminDashboardPage />} />
            <Route path="/super-admin/hostels" element={<SuperAdminHostelsPage />} />
            <Route path="/super-admin/admins" element={<SuperAdminAdminsPage />} />
            <Route path="/super-admin/subscriptions" element={<SuperAdminSubscriptionsPage />} />
            <Route path="/super-admin/plans" element={<SuperAdminPlansPage />} />
            <Route path="/super-admin/reports" element={<SuperAdminReportsPage />}
             />
            <Route path="/super-admin/settings" element={<SuperAdminSettingsPage />} />
            {/* <Route path="/admin/attendance" element={<AdminAttendancePage />} /> */}

            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/hostel-profile" element={<AdminHostelProfilePage />} />
            <Route path="/admin/my-hostels" element={<AdminMyHostelsPage />} />
            <Route path="/admin/inventory" element={<AdminInventoryPage />} />
            <Route path="/admin/rooms" element={<AdminInventoryPage />} />
            <Route path="/admin/supervisors" element={<AdminSupervisorsPage />} />
            <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/mess-menu" element={<AdminMessMenuPage />} />
            <Route path="/admin/notices" element={<AdminNoticesPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/students" element={<AdminStudentsPage />} />
            <Route path="/admin/maintenance" element={<AdminMaintenancePage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/supervisor/dashboard" element={<SupervisorDashboardPage />} />
            <Route path="/supervisor/attendance" element={<SupervisorAttendancePage />} />
            <Route path="/supervisor/complaints" element={<SupervisorComplaintsPage />} />
            <Route path="/supervisor/maintenance" element={<SupervisorMaintenancePage />} />
            <Route path="/supervisor/notices" element={<SupervisorNoticesPage />} />
            <Route path="/supervisor/students" element={<SupervisorStudentsPage />} />
            <Route path="/supervisor/mess-menu" element={<SupervisorMessMenuPage />} />
            <Route path="/supervisor/settings" element={<SupervisorSettingsPage />} />
            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
            <Route path="/student/bookings" element={<StudentBookingsPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route path="/student/attendance" element={<StudentAttendancePage />} />
            <Route path="/student/complaints" element={<StudentComplaintsPage />} />
            <Route path="/student/notices" element={<StudentNoticesPage />} />
            <Route path="/student/payments" element={<StudentPaymentsPage />} />
            <Route path="/student/mess-menu" element={<StudentMessMenuPage />} />
            <Route path="/student/waitlist" element={<StudentWaitlistPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
