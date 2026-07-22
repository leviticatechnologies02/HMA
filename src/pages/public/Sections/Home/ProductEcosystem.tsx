import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  Monitor,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

const PRODUCT_BLOCKS = [
  {
    title: "Student mobile app",
    subtitle: "For residents and students",
    description: "A self-service experience that gives residents simple, around-the-clock access to essential hostel services.",
    features: [
      "Room booking and allocation",
      "Secure online payments",
      "Maintenance requests",
      "Digital receipts and history",
      "Mess menu and preferences",
      "Instant announcements",
    ],
    image: "/img/Tenantapp.jpeg",
    icon: Smartphone,
    stat: "10,000+ active users",
    cta: { label: "Explore app", to: "/aboutus#complete-digital-solution" },
  },
  {
    title: "Admin dashboard",
    subtitle: "For management and staff",
    description: "A focused control center for monitoring occupancy, payments, teams, visitors, and resident documentation.",
    features: [
      "Role-based staff access",
      "Live occupancy tracking",
      "Payment reconciliation",
      "Staff task monitoring",
      "Visitor management",
      "Kyc verification",
    ],
    image: "/img/AdminDashboard.jpeg",
    icon: Monitor,
    stat: "100+ management tools",
    cta: { label: "Schedule a demo", to: "/contact" },
  },
  {
    title: "Analytics & reporting",
    subtitle: "For decision makers",
    description: "Clear operational and financial insights that turn everyday hostel data into confident, timely decisions.",
    features: [
      "Financial dashboards",
      "Occupancy forecasting",
      "Resident feedback analysis",
      "Resource utilization",
      "Compliance audit trails",
      "Custom reports",
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    icon: BarChart3,
    stat: "99% reporting accuracy",
    cta: { label: "Get started", to: "/register" },
  },
];

const INTEGRATION_FEATURES = [
  { label: "Real-time sync", icon: RefreshCw },
  { label: "Unified database", icon: Database },
  { label: "Secure access", icon: ShieldCheck },
];

function ProductEcosystem() {
  const shouldReduceMotion = useReducedMotion();
  const [activeProduct, setActiveProduct] = useState(0);
  const selectedProduct = PRODUCT_BLOCKS[activeProduct];
  const SelectedIcon = selectedProduct.icon;

  useEffect(() => {
    const rotationTimer = window.setInterval(() => {
      setActiveProduct((currentProduct) => (currentProduct + 1) % PRODUCT_BLOCKS.length);
    }, 10_000);

    return () => window.clearInterval(rotationTimer);
  }, []);

  return (
    <section className="relative overflow-hidden border-y border-slate-200 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="pointer-events-none absolute -left-44 top-24 h-80 w-80 rounded-full bg-primary/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute -right-44 bottom-10 h-80 w-80 rounded-full bg-secondary/[0.08] blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-12"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3.5 py-2 text-xs font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Integrated platform
          </span>
          <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight text-dark sm:text-4xl lg:text-5xl">
            One ecosystem. <span className="text-primary">Every hostel workflow.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Three purpose-built experiences working together to simplify management and improve every resident interaction.
          </p>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50/70 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
        >
          <div className="grid gap-2 p-1 sm:grid-cols-3" role="tablist" aria-label="Product modules">
            {PRODUCT_BLOCKS.map((product, index) => {
              const Icon = product.icon;
              const isActive = activeProduct === index;
              return (
                <button
                  key={product.title}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveProduct(index)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                    isActive
                      ? "border-primary bg-primary text-white shadow-md shadow-primary/15"
                      : "border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-dark"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isActive ? "bg-white/15" : "bg-white text-primary shadow-sm"}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{product.title}</span>
                    <span className={`mt-0.5 block truncate text-xs ${isActive ? "text-white/65" : "text-slate-400"}`}>{product.subtitle}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-2 overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedProduct.title}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="grid items-stretch lg:grid-cols-[0.88fr_1.12fr]"
              >
                <div className="flex flex-col p-6 sm:p-8 lg:p-10">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <SelectedIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-primary">{selectedProduct.subtitle}</p>
                      <p className="mt-1 text-xs text-slate-400">{selectedProduct.stat}</p>
                    </div>
                  </div>

                  <h3 className="mt-5 font-heading text-3xl font-bold tracking-tight text-dark sm:text-4xl">{selectedProduct.title}</h3>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">{selectedProduct.description}</p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {selectedProduct.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 text-xs font-medium leading-5 text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Link
                    to={selectedProduct.cta.to}
                    className="group mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#09454a]"
                  >
                    {selectedProduct.cta.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <div className="relative min-h-[330px] overflow-hidden bg-[#eaf2f1] p-4 sm:min-h-[430px] sm:p-6 lg:min-h-full lg:p-8">
                  <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
                  <div className="relative h-full overflow-hidden rounded-2xl border border-white bg-white p-2 shadow-2xl shadow-slate-900/15">
                    <div className="flex h-9 items-center gap-1.5 border-b border-slate-100 px-3">
                      <span className="h-2 w-2 rounded-full bg-red-300" />
                      <span className="h-2 w-2 rounded-full bg-amber-300" />
                      <span className="h-2 w-2 rounded-full bg-emerald-300" />
                      <span className="mx-auto h-4 w-32 rounded-full bg-slate-100" />
                    </div>
                    <img
                      src={selectedProduct.image}
                      alt={`${selectedProduct.title} interface preview`}
                      className="h-[calc(100%-2.25rem)] w-full rounded-b-xl object-cover object-top"
                    />
                  </div>
                  <div className="absolute bottom-7 right-7 inline-flex items-center gap-2 rounded-xl border border-white/50 bg-white/90 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                    </span>
                    Live and synchronized
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-6 overflow-hidden rounded-3xl bg-[#0d5c63] px-6 py-8 text-white shadow-xl shadow-primary/15 sm:px-8 lg:px-10"
        >
          <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full border-[42px] border-white/[0.05]" />
          <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-semibold text-white/60">Connected by design</p>
              <h3 className="mt-2 max-w-2xl font-heading text-2xl font-bold sm:text-3xl">All modules stay perfectly synchronized.</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                A single source of truth keeps teams, residents, payments, and reports accurate across every device.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {INTEGRATION_FEATURES.map(({ label, icon: FeatureIcon }) => (
                  <span key={label} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white/90">
                    <FeatureIcon className="h-3.5 w-3.5" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <Link
              to="/contact"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50"
            >
              View platform
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ProductEcosystem;
