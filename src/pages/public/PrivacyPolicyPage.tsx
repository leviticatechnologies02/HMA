import { Link } from "react-router-dom";
import { ArrowRight, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, make a booking, or contact our support team. This may include your name, email address, phone number, hostel preferences, payment information, and any other information you choose to provide."
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, process your transactions, send transactional and promotional communications, respond to your inquiries, and comply with legal obligations. We may also use aggregated or anonymized data for analytics and improving our platform."
    },
    {
      title: "3. Data Security",
      content: "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is completely secure. We cannot guarantee absolute security of your information."
    },
    {
      title: "4. Cookies and Tracking Technologies",
      content: "We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you disable cookies, some features of our platform may not function properly."
    },
    {
      title: "5. Third-Party Service Providers",
      content: "We may share your information with third-party service providers who perform services on our behalf, including payment processors, email service providers, and analytics providers. These service providers are contractually obligated to use your information only as necessary to provide services to us."
    },
    {
      title: "6. Legal Disclosure",
      content: "We may disclose your personal information if required by law or if we believe in good faith that such disclosure is necessary to: comply with a legal obligation, protect and defend our rights or property, prevent or investigate possible wrongdoing in connection with the service, or protect the personal safety of users of HostelMS or the public."
    },
    {
      title: "7. Children's Privacy",
      content: "HostelMS is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information and terminate the child's account."
    },
    {
      title: "8. Your Privacy Rights",
      content: "Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data. You may also have the right to opt-out of certain data uses. Please contact us to exercise any of these rights."
    },
    {
      title: "9. Data Retention",
      content: "We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. You may request deletion of your data at any time, subject to certain legal obligations that may require us to retain certain information."
    },
    {
      title: "10. International Data Transfers",
      content: "Your information may be transferred to, stored in, and processed in countries other than your country of residence. These countries may have data protection laws that differ from your home country. By using HostelMS, you consent to the transfer of your information to countries outside your country of residence."
    },
    {
      title: "11. Changes to This Privacy Policy",
      content: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on our website and updating the 'Last Updated' date. Your continued use of HostelMS following the posting of revised Privacy Policy means you accept and agree to the changes."
    },
    {
      title: "12. Contact Us",
      content: "If you have any questions about this Privacy Policy or our privacy practices, please contact us through our support channels. We are committed to working with you to resolve any privacy concerns."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral via-white to-neutral dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat px-4 py-20 md:py-28"
        style={{ backgroundImage: "url('/img/Touch1.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#06282d]/75 via-[#06282d]/50 to-transparent"></div>
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[#9dd9d2] opacity-15 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#f0d9a7] opacity-10 blur-3xl"></div>

        <div className="relative mx-auto max-w-5xl">
          <div className="space-y-6 rounded-3xl border border-white/50 bg-white/18 p-8 text-center shadow-[0_30px_80px_rgba(6,40,45,0.18)] backdrop-blur-2xl transition-all duration-500 hover:border-white/60 hover:bg-white/24 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/16 px-5 py-2.5 shadow-sm">
              <div className="relative h-2 w-2">
                <div className="absolute inset-0 rounded-full bg-white animate-pulse"></div>
                <div className="absolute inset-0 rounded-full bg-white animate-ping"></div>
              </div>
              <span className="text-sm font-semibold tracking-wide text-white/95">
                Data Protection
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
              Privacy{" "}
              <span className="text-accent">
                Policy
              </span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-white/90 drop-shadow-md sm:text-xl">
              Your privacy is important to us. Learn how HostelMS collects, uses, and protects your personal information.
            </p>

            <p className="mx-auto max-w-3xl text-base text-white/80">
              Last updated: April 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          {/* Key Privacy Principles */}
          <div className="mb-12 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
              <Shield className="mx-auto mb-3 h-8 w-8 text-accent" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Secure</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Your data is protected with encryption</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
              <Shield className="mx-auto mb-3 h-8 w-8 text-accent" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Transparent</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">We're clear about how we use data</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-800">
              <Shield className="mx-auto mb-3 h-8 w-8 text-accent" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Respectful</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">We respect your choices and rights</p>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 sm:p-8">
                <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
                  {section.title}
                </h2>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Important Notice */}
          <div className="mt-16 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-900/20 sm:p-8">
            <h3 className="mb-4 text-lg font-semibold text-blue-900 dark:text-blue-200">
              GDPR Compliance
            </h3>
            <p className="text-blue-800 dark:text-blue-300">
              If you are located in the European Union, United Kingdom, or other regions with data protection regulations, we comply with the General Data Protection Regulation (GDPR) and other applicable laws. You have the right to access, correct, or request deletion of your personal data.
            </p>
          </div>
        </div>
      </section>

      {/* Next Page Navigation */}
      <section className="border-t border-neutral-200 bg-neutral/30 px-4 py-12 dark:border-slate-700 dark:bg-slate-900/20">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/terms"
              className="inline-flex items-center gap-3 rounded-lg border border-neutral-300 px-6 py-3 font-semibold text-slate-900 transition-all duration-300 hover:border-accent hover:bg-accent/5 dark:border-slate-600 dark:text-white dark:hover:bg-accent/10"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
              Previous: Terms of Service
            </Link>
            <Link
              to="/help"
              className="inline-flex items-center gap-3 rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-accent/90"
            >
              Next: Help Center
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>


    </div>
  );
}
