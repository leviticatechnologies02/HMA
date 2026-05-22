import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Search, BookOpen, Lightbulb, Users, Settings, ArrowRight, MessageCircle } from "lucide-react";

export default function HelpCenter() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: 1,
      title: "Getting Started",
      icon: BookOpen,
      articles: [
        { title: "What is HostelMS?", slug: "what-is-hostelms" },
        { title: "How to Create an Account", slug: "create-account" },
        { title: "Setting Up Your Profile", slug: "setup-profile" },
        { title: "First Booking Guide", slug: "first-booking" },
      ]
    },
    {
      id: 2,
      title: "Bookings & Reservations",
      icon: Lightbulb,
      articles: [
        { title: "How to Book a Hostel", slug: "how-to-book" },
        { title: "Modifying Your Booking", slug: "modify-booking" },
        { title: "Cancellation Policy", slug: "cancellation-policy" },
        { title: "Understanding Prices", slug: "understand-prices" },
      ]
    },
    {
      id: 3,
      title: "Account & Payments",
      icon: Users,
      articles: [
        { title: "Payment Methods", slug: "payment-methods" },
        { title: "Billing History", slug: "billing-history" },
        { title: "Refund Process", slug: "refund-process" },
        { title: "Updating Payment Info", slug: "update-payment" },
      ]
    },
    {
      id: 4,
      title: "Technical Support",
      icon: Settings,
      articles: [
        { title: "App Won't Load", slug: "app-wont-load" },
        { title: "Login Issues", slug: "login-issues" },
        { title: "Password Reset", slug: "password-reset" },
        { title: "System Requirements", slug: "system-requirements" },
      ]
    }
  ];

  const faqs = [
    {
      id: 1,
      question: "How do I make a booking on HostelMS?",
      answer: "To make a booking, first search for hostels by location and dates. Select your preferred hostel and room type, review the details, and proceed to checkout. You'll need to provide your payment information to confirm the booking."
    },
    {
      id: 2,
      question: "Can I modify or cancel my booking?",
      answer: "Yes, you can modify or cancel your booking up to 7 days before your arrival date. Cancellations made within 7 days may be subject to a cancellation fee. Check our full Cancellation Policy for more details."
    },
    {
      id: 3,
      question: "What payment methods do you accept?",
      answer: "We accept credit/debit cards (Visa, MasterCard, American Express), digital wallets, and bank transfers. Payment options may vary depending on your location."
    },
    {
      id: 4,
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the login page. Enter your email address and we'll send you a password reset link. Follow the instructions in the email to create a new password."
    },
    {
      id: 5,
      question: "Is my personal information secure?",
      answer: "Yes, we use industry-standard encryption and security measures to protect your personal information. We comply with GDPR and other data protection regulations. See our Privacy Policy for more details."
    },
    {
      id: 6,
      question: "How do I contact customer support?",
      answer: "You can reach our support team via email, phone, or live chat. We're available 24/7 to help with any questions or issues. Click the support button in your account or visit our Contact page."
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                Support & Resources
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
              Help{" "}
              <span className="text-accent">
                Center
              </span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-white/90 drop-shadow-md sm:text-xl">
              Find answers to your questions and get help with HostelMS. Browse our guides, FAQs, and support articles.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="border-b border-neutral-200 bg-white px-4 py-12 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-3 pl-12 pr-4 text-slate-900 placeholder-slate-500 transition-all duration-300 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900 dark:text-white">
            Browse by Category
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:border-accent hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-accent/10 p-3">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
                    {category.title}
                  </h3>
                  <ul className="space-y-2">
                    {category.articles.map((article) => (
                      <li key={article.slug}>
                        <a
                          href={`#${article.slug}`}
                          className="text-sm text-slate-600 transition-colors duration-300 hover:text-accent dark:text-slate-400 dark:hover:text-accent"
                        >
                          {article.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-neutral-200 bg-neutral/30 px-4 py-16 dark:border-slate-700 dark:bg-slate-900/20 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="rounded-2xl border border-neutral-200 bg-white transition-all duration-300 dark:border-slate-700 dark:bg-slate-800"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  className="flex w-full items-center justify-between p-6 text-left hover:bg-neutral-50 dark:hover:bg-slate-700/50"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-300 text-slate-600 dark:text-slate-400 ${
                      expandedFAQ === faq.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFAQ === faq.id && (
                  <div className="border-t border-neutral-200 bg-neutral-50 p-6 dark:border-slate-700 dark:bg-slate-700/30">
                    <p className="text-slate-600 dark:text-slate-400">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-slate-600 dark:text-slate-400">
                No results found for "{searchQuery}". Try a different search term.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/5 to-accent/10 p-8 text-center dark:from-accent/10 dark:to-accent/20 sm:p-12">
            <MessageCircle className="mx-auto mb-4 h-12 w-12 text-accent" />
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Can't find what you're looking for?
            </h2>
            <p className="mb-8 text-lg text-slate-600 dark:text-slate-400">
              Our support team is here to help! Reach out to us and we'll get back to you as soon as possible.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-accent/90 hover:gap-3"
              >
                Contact Support
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="mailto:support@hostelms.com"
                className="inline-flex items-center gap-2 rounded-lg border border-accent/30 px-6 py-3 font-semibold text-accent transition-all duration-300 hover:bg-accent/10"
              >
                Email Support
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Next Page Navigation */}
      <section className="border-t border-neutral-200 bg-neutral/30 px-4 py-12 dark:border-slate-700 dark:bg-slate-900/20">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-start">
            <Link
              to="/privacy"
              className="inline-flex items-center gap-3 rounded-lg border border-neutral-300 px-6 py-3 font-semibold text-slate-900 transition-all duration-300 hover:border-accent hover:bg-accent/5 dark:border-slate-600 dark:text-white dark:hover:bg-accent/10"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
              Previous: Privacy Policy
            </Link>
          </div>
        </div>
      </section>


    </div>
  );
}
