import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function TermsOfService() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using HostelMS, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
      title: "2. Use License",
      content: "Permission is granted to temporarily download one copy of the materials (information or software) on HostelMS for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to decompile or reverse engineer any software contained on HostelMS; remove any copyright or other proprietary notations from the materials; transfer the materials to another person or 'mirror' the materials on any other server."
    },
    {
      title: "3. Disclaimer",
      content: "The materials on HostelMS are provided on an 'as is' basis. HostelMS makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
    },
    {
      title: "4. Limitations",
      content: "In no event shall HostelMS or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on HostelMS, even if HostelMS or a HostelMS authorized representative has been notified orally or in writing of the possibility of such damage."
    },
    {
      title: "5. Accuracy of Materials",
      content: "The materials appearing on HostelMS could include technical, typographical, or photographic errors. HostelMS does not warrant that any of the materials on HostelMS are accurate, complete, or current. HostelMS may make changes to the materials contained on HostelMS at any time without notice."
    },
    {
      title: "6. Links",
      content: "HostelMS has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by HostelMS of the site. Use of any such linked website is at the user's own risk."
    },
    {
      title: "7. Modifications",
      content: "HostelMS may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service."
    },
    {
      title: "8. Governing Law",
      content: "These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which HostelMS is located, and you irrevocably submit to the exclusive jurisdiction of the courts located in that location."
    },
    {
      title: "9. User Accounts",
      content: "When you create an account on HostelMS, you must provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account information and password and for all activities that occur under your account. You agree to notify HostelMS immediately of any unauthorized use of your account."
    },
    {
      title: "10. User Conduct",
      content: "You agree not to use HostelMS for any unlawful purpose or in any way that could damage, disable, or impair the service. You further agree not to engage in any conduct that restricts or inhibits anyone's use or enjoyment of HostelMS."
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
                Legal & Transparency
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
              Terms of{" "}
              <span className="text-accent">
                Service
              </span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-white/90 drop-shadow-md sm:text-xl">
              Please read these terms carefully before using HostelMS. By accessing and using our platform, you agree to be bound by these terms.
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
          <div className="space-y-12">
            {sections.map((section, index) => (
              <div key={index} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 sm:p-8">
                <h2 className="mb-4 flex items-start gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 text-accent mt-0.5" />
                  {section.title}
                </h2>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Additional Info Box */}
          <div className="mt-16 rounded-2xl border border-accent/30 bg-accent/5 p-6 sm:p-8">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Questions About Our Terms?
            </h3>
            <p className="mb-6 text-slate-600 dark:text-slate-400">
              If you have any questions about these Terms of Service or need clarification on any point, please don't hesitate to reach out to our support team.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-accent/90 hover:gap-3"
            >
              Contact Support
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Next Page Navigation */}
      <section className="border-t border-neutral-200 bg-neutral/30 px-4 py-12 dark:border-slate-700 dark:bg-slate-900/20">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-end">
            <Link
              to="/privacy"
              className="inline-flex items-center gap-3 rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-accent/90"
            >
              Next: Privacy Policy
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>


    </div>
  );
}
