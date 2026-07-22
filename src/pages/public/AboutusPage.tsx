import React from "react";
import { Link } from "react-router-dom";
import {
  Smartphone,
  Users,
  Shield,
  Calendar,
  Rocket,
  Target,
  Handshake,
  Clock,
  Bed,
  ArrowRight,
  RefreshCw,
  Heart,
  UserPlus,
  Wallet,
  BarChart3,
  CalendarDays,
  MessageSquare,
  Bell,
} from "lucide-react";

const AboutApp = () => {
  return (
    <main className="overflow-hidden bg-neutral dark:bg-slate-950">
      <section
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat px-6 pt-20 pb-16 bg-dark"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&h=600&fit=crop")',
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-[#06282d]/45 backdrop-blur-[2px]"></div>
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[#9dd9d2] opacity-25 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#f0d9a7] opacity-20 blur-3xl"></div>

        <div className="relative mx-auto max-w-5xl space-y-6 rounded-3xl border border-white/50 bg-white/18 p-10 text-center shadow-[0_30px_80px_rgba(6,40,45,0.18)] backdrop-blur-2xl transition-all duration-500 hover:border-white/60 hover:bg-white/24">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

          <h1 className="relative font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white drop-shadow-lg">
            About <span className="text-accent">Leviticanestora</span>
          </h1>

          <p className="relative text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Transforming hostel and PG management into a seamless digital
            experience enabling smarter operations, happier students, and
            effortless control.
          </p>

          <div className="relative flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link to="/register">
              <button className="btn-primary px-5 py-3">Get Started</button>
            </Link>
            <Link to="/">
              <button className="rounded-xl border-2 border-white px-3 py-2.5 font-semibold text-white transition hover:bg-white/20">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white dark:bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
        {/* Background Blur */}
        <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl"></div>

        <div className="max-w-7xl mx-auto">
          {/* Hero Content */}
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="-mt-2 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight text-slate-900 dark:text-white">
              Smart Hostel <br />
              <span className="text-primary">Management System</span>
            </h2>

            <div className="mt-8 space-y-6">
              <p className="text-xl leading-9 text-slate-600 dark:text-slate-300">
                Our platform transforms hostel operations into a seamless
                digital experience reducing manual work and improving
                efficiency.
              </p>

              <p className="text-xl leading-9 text-slate-600 dark:text-slate-300">
                From admissions to fee tracking, everything is centralized in
                one secure system designed for administrators and students.
              </p>

              <Link to="/">
                <button className="mt-3 px-10 py-4 rounded-2xl bg-primary text-white font-semibold text-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300">
                  Explore Features →
                </button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Admissions",
                description: "Manage student onboarding digitally with ease.",
                icon: <UserPlus className="w-5 h-5 text-primary" />,
              },
              {
                title: "Fee Tracking",
                description:
                  "Secure and transparent payment management system.",
                icon: <Wallet className="w-5 h-5 text-primary" />,
              },
              {
                title: "Reports",
                description: "Generate insights and reports instantly.",
                icon: <BarChart3 className="w-5 h-5 text-primary" />,
              },
              {
                title: "Attendance",
                description: "Real-time attendance tracking and notifications.",
                icon: <CalendarDays className="w-5 h-5 text-primary" />,
              },
              {
                title: "Complaints",
                description:
                  "Manage maintenance and complaint resolution efficiently.",
                icon: <MessageSquare className="w-5 h-5 text-primary" />,
              },
              {
                title: "Announcements",
                description:
                  "Send instant notifications to all students and staff.",
                icon: <Bell className="w-5 h-5 text-primary" />,
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="group relative flex min-h-[180px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-primary/[0.04] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 dark:border-slate-700 dark:from-slate-800 dark:via-slate-800 dark:to-primary/10"
              >
                <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/10 bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                    {item.icon}
                  </div>
                  <span className="font-heading text-xs font-semibold tracking-[0.18em] text-slate-300 dark:text-slate-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h4 className="mb-2 font-heading text-xl font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h4>

                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {item.description}
                </p>

                <div className="mt-auto pt-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-colors group-hover:bg-primary/10 group-hover:text-primary dark:bg-slate-700 dark:text-slate-400">
                    Smart workflow
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="relative bg-white dark:bg-slate-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start mb-12">
            <div className="space-y-6">
              <div className="group relative overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-700 bg-primary p-10 text-white shadow-lg hover:shadow-xl transition lg:p-12">
                <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

                <div className="relative space-y-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm transition-all group-hover:bg-white/20">
                    <Rocket className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="font-heading text-3xl font-bold tracking-tight leading-tight text-white">
                    Our Approach
                  </h3>

                  <div className="space-y-4">
                    <p className="text-white/90 leading-relaxed text-lg">
                      We believe hostel management should be simple,
                      transparent, and stress-free. Our platform is designed by
                      understanding real hostel challenges, not just technical
                      requirements.
                    </p>

                    <p className="text-white/90 leading-relaxed text-lg">
                      We work closely with hostel owners, wardens, and students
                      to ensure every feature genuinely improves daily
                      operations and living experience.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 dark:bg-primary/20 px-4 py-2 text-sm font-semibold text-primary">
                  <Users className="w-4 h-4" />
                  <span>OUR STORY</span>
                </div>

                <h2 className="font-heading text-4xl sm:text-5xl font-bold text-dark dark:text-white leading-tight tracking-tight">
                  Built by <span className="text-primary"> People</span> Who
                  Understand
                  <span className="text-primary"> Hostels</span>
                </h2>

                <div className="h-1 w-24 rounded-full bg-primary" />

                <div className="space-y-6 text-slate-600 dark:text-slate-300">
                  <p className="text-lg leading-relaxed">
                    Our journey began with a simple observation that hostel
                    management was overloaded with paperwork, manual tracking,
                    and outdated systems that slowed everyone down.
                  </p>

                  <p className="text-lg leading-relaxed">
                    Students struggled to access information, wardens spent hours
                    on routine tasks, and administrators lacked real-time
                    visibility into operations.
                  </p>

                  <p className="text-lg leading-relaxed">
                    We built this Hostel Management System to bring clarity,
                    automation, and control to hostel operations, helping
                    hostels operate efficiently while creating a better
                    experience for residents.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="relative space-y-6 overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-lg hover:shadow-xl transition lg:p-10">
              <style>{`@keyframes autoScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .auto-scroll { animation: autoScroll 60s linear infinite; } .auto-scroll:hover { animation-play-state: paused; }`}</style>

              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 px-4 py-2 text-sm font-semibold text-dark dark:text-white">
                  ✨ Core Strengths
                </div>
                <h4 className="font-heading text-2xl font-bold text-dark dark:text-white lg:text-3xl">
                  Our Values & Vision
                </h4>
              </div>

              <div className="overflow-hidden -mx-8 -mb-8 -mt-2 ">
                <div className="auto-scroll flex gap-4 w-fit px-8 pb-8 ">
                  {[
                    {
                      icon: <Target />,
                      title: "Clear Focus",
                      text: "Real hostel problems. We understand the day-to-day challenges faced by administrators and students.",
                      type: "value",
                      color: "from-[#0d5c63] to-[#1b7f8e]",
                    },
                    {
                      icon: <Handshake />,
                      title: "Long-term Partnerships",
                      text: "We build lasting relationships by understanding their needs and continuously supporting them with reliable solutions.",
                      type: "value",
                      color: "from-[#1b7f8e] to-[#9dd9d2]",
                    },
                    {
                      icon: <RefreshCw />,
                      title: "Continuous Improvement",
                      text: "We actively listen to users and refine our platform to deliver better performance and usability.",
                      type: "value",
                      color: "from-[#13876f] to-[#1f9d84]",
                    },
                    {
                      icon: <Heart />,
                      title: "Student Comfort First",
                      text: "We prioritize a secure, convenient living experience by ensuring reliable systems and transparent processes.",
                      type: "value",
                      color: "from-[#c79a3b] to-[#f0d9a7]",
                    },
                    {
                      icon: <Target />,
                      title: "Our Focus",
                      text: "Simplifying hostel operations. We streamline daily tasks through smart automation and centralized management.",
                      type: "value",
                      color: "from-[#0d5c63] to-[#1b7f8e]",
                    },
                    {
                      icon: <Shield />,
                      title: "Our Promise",
                      text: "Reliable & transparent systems. We ensure consistent performance and clear processes.",
                      type: "value",
                      color: "from-[#13876f] to-[#1f9d84]",
                    },
                    {
                      icon: <Users />,
                      title: "Our Team",
                      text: "Domain experts & engineers. Our team combines deep industry knowledge with technical expertise to build reliable solutions.",
                      type: "value",
                      color: "from-[#1b7f8e] to-[#9dd9d2]",
                    },
                    {
                      icon: <Rocket />,
                      title: "Our Vision",
                      text: "Smarter hostels everywhere. We aim to revolutionize the hostel experience through innovative technology and thoughtful design.",
                      type: "value",
                      color: "from-[#c79a3b] to-[#f0d9a7]",
                    },
                    {
                      icon: <Target />,
                      title: "Technical Expertise",
                      text: "Our team blends deep industry insight with strong technical expertise to build reliable, scalable solutions.",
                      type: "value",
                      color: "from-[#0d5c63] to-[#1b7f8e]",
                    },
                    {
                      icon: <Handshake />,
                      title: "Global Partnerships",
                      text: "Long-term partnerships with hostels, driving smarter and more efficient hostel management everywhere.",
                      type: "value",
                      color: "from-[#1b7f8e] to-[#9dd9d2]",
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex-shrink-0 w-80 h-64">
                      <div className="flex h-full transform flex-col justify-between rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm hover:shadow-lg dark:hover:shadow-lg/30 transition hover:scale-105 group/card">
                        <div>
                          <div
                            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform`}
                          >
                            <span className="text-white text-2xl">
                              {item.icon}
                            </span>
                          </div>
                          <h4 className="font-heading text-dark font-semibold text-base mb-2">
                            {item.title}
                          </h4>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-[#d9f3ef] opacity-25 blur-3xl" />
        <div className="absolute top-1/3 right-0 -z-10 h-80 w-80 rounded-full bg-[#f6e8bf] opacity-20 blur-3xl" />
      </section>

      <section
        className="relative py-20 px-4 sm:px-6 lg:px-8 bg-neutral dark:bg-slate-950"
        id="complete-digital-solution"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-dark dark:text-white tracking-tight">
              Complete <span className="text-primary"> Digital</span> Solution
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Everything you need for modern hostel management
            </p>
            <div className="mx-auto mt-6 h-1 w-32 rounded-full bg-primary" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                icon: Smartphone,
                title: "Mobile-First Experience",
                description:
                  "Students can book rooms, pay fees, and manage everything from their phones. Real-time updates and notifications keep everyone connected.",
                features: [
                  "Mobile bookings",
                  "Push notifications",
                  "Digital payments",
                ],
                color: "from-primary to-primary/90",
                bgColor: "from-[#e6f4f3] to-[#d9f3ef]",
                accentColor: "text-primary",
                number: "01",
              },
              {
                icon: Users,
                title: "Smart User Management",
                description:
                  "Separate portals for students, wardens, and admin staff with role-based permissions. Each user gets exactly what they need.",
                features: [
                  "Student portal",
                  "Warden dashboard",
                  "Admin controls",
                ],
                color: "from-primary/90 to-primary",
                bgColor: "from-[#e6f4f3] to-[#eef8f7]",
                accentColor: "text-primary",
                number: "02",
              },
              {
                icon: Shield,
                title: "Secure Platform",
                description:
                  "Bank-level security with encrypted data, secure payments, and complete audit trails. Your data is protected with enterprise-grade security.",
                features: ["Data encryption", "Secure payments", "Audit logs"],
                color: "from-accent/80 to-accent",
                bgColor: "from-[#e8f6f1] to-[#eefaf6]",
                accentColor: "text-accent",
                number: "03",
              },
            ].map((card, index) => {
              const Icon = card.icon;

              return (
                <div key={index} className="group relative h-full">
                  <div className="relative h-full overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm hover:shadow-lg dark:hover:shadow-lg/30 transition lg:p-10">
                    <div
                      className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${card.color}`}
                    />
                    <div
                      className={`absolute top-6 right-6 text-6xl font-black opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity ${card.accentColor}`}
                    >
                      {card.number}
                    </div>
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-8 mt-2 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}
                    >
                      <Icon className="text-white text-3xl" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-dark dark:text-white mb-4 leading-tight">
                      {card.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed text-base">
                      {card.description}
                    </p>
                    <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                      {card.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 group/feature"
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${card.color} group-hover/feature:scale-150 transition-transform`}
                          ></div>
                          <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-6 h-6 border-b-2 border-l-2 border-slate-200 dark:border-slate-600 rounded-bl-2xl"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute top-1/2 -left-40 -z-10 h-80 w-80 rounded-full bg-primary/5 dark:bg-primary/10 opacity-25 blur-3xl" />
        <div className="absolute bottom-0 right-10 -z-10 h-96 w-96 rounded-full bg-accent/5 dark:bg-accent/10 opacity-20 blur-3xl" />
      </section>

      <section className="relative mx-4 mt-8 mb-16 rounded-2xl border-l-4 border-accent bg-primary dark:bg-primary/90 text-white shadow-lg hover:shadow-xl transition sm:mx-6 lg:mx-auto lg:max-w-6xl">
        <div className="absolute -top-4 -right-4 z-10 rounded-full border-2 border-white bg-accent px-4 py-2 text-xs font-bold text-dark shadow-lg">
          NEW
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-6 sm:px-8 py-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0 mt-1">
              <Calendar className="text-2xl text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="font-heading text-xl sm:text-2xl font-bold leading-tight text-white">
                Day Wise Room Booking Available
              </h3>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                Perfect for short visits, exams, or guest stays. Book by the day
                with instant confirmation.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <span className="flex items-center gap-2 text-xs sm:text-sm text-white/90">
                  <Clock className="text-white" /> Flexible check-in
                </span>
                <span className="flex items-center gap-2 text-xs sm:text-sm text-white/90">
                  <Shield className="text-white" /> Secure payments
                </span>
              </div>
            </div>
          </div>

          <Link to="/hostels" className="w-full sm:w-auto flex-shrink-0">
            <button className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border-2 border-white bg-white px-6 py-3 font-bold text-primary shadow-lg transition-all hover:bg-neutral hover:shadow-xl sm:w-auto">
              <Bed className="text-base" />
              <span>Explore Rooms</span>
            </button>
          </Link>
        </div>
      </section>
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-neutral dark:from-slate-900 dark:via-slate-950 to-white dark:to-slate-900 px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-96 w-full -translate-x-1/2 bg-gradient-to-b from-primary/10 dark:from-primary/5 to-transparent" />
          <div className="absolute top-1/3 left-0 h-80 w-80 rounded-full bg-primary/5 dark:bg-primary/10 opacity-30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/5 dark:bg-accent/10 opacity-20 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative space-y-6">
          <div>
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-lg">
              <Rocket className="text-5xl text-white" />
            </div>
          </div>

          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-dark dark:text-white leading-tight tracking-tight">
            Ready to <span className="text-primary"> Modernize</span> <br />{" "}
            <span className="text-primary"> Your</span> Hostel?
          </h2>

          <div className="mx-auto h-1 w-24 rounded-full bg-primary" />

          <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Join hostels that have replaced paperwork and manual tracking with a
            smart, centralized management system. Get better control, improved
            communication, and a smoother experience for students and staff.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register" className="w-full sm:w-auto">
              <button
                className="
        w-full sm:w-auto
        px-8 py-4
        rounded-xl
        bg-[#2A7C88]
        text-white
        font-semibold
        flex items-center justify-center gap-3
        transition
        hover:bg-[#236974]
      "
              >
                Get Started
                <ArrowRight size={20} />
              </button>
            </Link>

            <Link to="/contact#contact-form" className="w-full sm:w-auto">
              <button
                className="
        w-full sm:w-auto
        px-8 py-4
        rounded-xl
        bg-[#2A7C88]
        text-white
        font-semibold
        flex items-center justify-center gap-3
        hover:bg-[#2A7C88]
        transition-none
      "
              >
                Schedule Demo
                <Calendar size={20} />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutApp;
