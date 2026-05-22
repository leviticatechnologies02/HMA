import React from "react";
import { Link } from "react-router-dom";
import { Smartphone, Monitor, BarChart3, ArrowRight, CheckCircle2, Users, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

function ProductEcosystem() {
  const productBlocks = [
    {
      title: "Tenant Mobile App",
      subtitle: "For Residents & Tenants",
      desc: "Self-service portal for tenants to manage their hostel experience from anywhere. Complete independence with 24/7 access to essential services.",
      features: [
        "Room booking & allocation requests",
        "Secure online fee payments (UPI/Cards/NetBanking)",
        "Maintenance requests with photo upload",
        "Digital receipts & payment history",
        "Mess menu & meal preferences",
        "Instant notifications & announcements"
      ],
      img: "/img/Tenantapp.jpeg",
      mobileMockup: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=400&q=80",
      icon: Smartphone,
      color: "from-[#0d5c63] to-[#1b7f8e]",
      gradient: "bg-gradient-to-br from-[#0d5c63] to-[#1b7f8e]",
      cta: { label: "Explore features", to: "/aboutus#complete-digital-solution" },
      stats: "10,000+ Active Users"
    },
    {
      title: "Admin Dashboard",
      subtitle: "For Management & Staff",
      desc: "Centralized control panel providing complete oversight of hostel operations. Real-time monitoring and management tools for administrators.",
      features: [
        "Role-based access for Deans, Wardens, Caretakers",
        "Live occupancy & vacancy tracking",
        "Automated payment reconciliation",
        "Staff task assignment & monitoring",
        "Visitor management system",
        "Document management & KYC verification"
      ],
      img: "/img/AdminDashboard.jpeg",
      icon: Monitor,
      color: "from-[#0d5c63] to-[#1b7f8e]",
      gradient: "bg-gradient-to-br from-[#0d5c63] to-[#1b7f8e]",
      cta: { label: "Schedule a Demo", to: "/contact" },
      stats: "100+ Features"
    },
    {
      title: "Analytics & Reporting",
      subtitle: "For Decision Makers",
      desc: "Comprehensive insights and visual analytics to drive informed decisions. Customizable reports and dashboards for strategic planning.",
      features: [
        "Real-time financial dashboards",
        "Occupancy trends & forecasting",
        "Tenant feedback analysis",
        "Resource utilization reports",
        "Audit trails & compliance logs",
        "Custom report generation"
      ],
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      icon: BarChart3,
      color: "from-[#0d5c63] to-[#1b7f8e]",
      gradient: "bg-gradient-to-br from-[#0d5c63] to-[#1b7f8e]",
      cta: { label: "Get Started", to: "/register" },
      stats: "99% Accuracy Rate"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const getSideVariants = (direction = "left") => ({
    hidden: {
      opacity: 0,
      x: direction === "left" ? -80 : 80,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7 },
    },
  });

  return (
    <section className="bg-neutral px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

    
    <motion.div className="text-center max-w-3xl mx-auto mb-16 lg:mb-12">
      <div className="inline-flex items-center gap-2 bg-[#e6f4f3] text-[#0d5c63] px-4 py-2 rounded-full text-sm font-semibold mb-6">
        <div className="w-2 h-2 bg-[#0d5c63] rounded-full"></div>
        INTEGRATED PLATFORM
      </div>

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark mb-6">
        Unified Hostel{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0d5c63] to-[#1b7f8e]">
          Management System
        </span>
      </h2>

      <p className="text-lg sm:text-xl text-slate-600 leading-relaxed px-4">
        Three specialized modules working in perfect harmony to streamline every aspect of hostel administration and resident experience.
      </p>
    </motion.div>

    
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      className="space-y-16 lg:space-y-20"
    >
      {productBlocks.map((block, index) => {
        const Icon = block.icon;
        const direction = index % 2 === 0 ? "left" : "right";

        return (
          <motion.div
            key={index}
            className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
          >

            
            <motion.div
              variants={getSideVariants(direction)}
              className={`relative ${
                index % 2 === 1 ? "lg:order-2" : ""
              }`}
            >
              <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                <img
                  src={block.img}
                  alt=""
                  className="w-full h-72 object-cover"
                />
              </div>

              <div
                className={`absolute -top-6 -right-6 w-16 h-16 ${block.gradient} rounded-2xl flex items-center justify-center shadow-xl border-4 border-white`}
              >
                <Icon className="text-white w-7 h-7" />
              </div>

              <div className="absolute -bottom-3 left-6 bg-white px-4 py-2 rounded-lg shadow border">
                <span className="text-sm font-semibold text-slate-700">
                  {block.stats}
                </span>
              </div>
            </motion.div>

            
            <motion.div
              variants={getSideVariants(direction === "left" ? "right" : "left")}
              className={`${index % 2 === 1 ? "lg:order-1" : ""}`}
            >
              <h3 className="text-3xl font-bold text-dark mb-4">
                {block.title}
              </h3>

              <p className="text-lg text-slate-600 mb-6">
                {block.desc}
              </p>

              
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {block.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl bg-[#dcebea] px-4 py-3 border-l-4 border-[#0d5c63] hover:bg-[#cfe3e1] transition duration-300 dark:bg-[#252540] dark:hover:bg-[#2D3548] dark:border-l-4 dark:border-[#0d5c63] dark:text-[#E2E8F0]"
                  >
                    <div className="flex items-center justify-center h-7 w-7 rounded-md bg-[#0d5c63]/10">
                      <CheckCircle2 className="h-4 w-4 text-[#0d5c63]" />
                    </div>

                    <p className="text-sm font-semibold text-dark leading-tight">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>

              
              <Link
                to={block.cta.to}
                className="inline-flex items-center gap-2 bg-[#0d5c63] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#09454a]"
              >
                {block.cta.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

          </motion.div>
        );
      })}
    </motion.div>

    
<div className="mt-16 bg-gradient-to-r from-[#e6f4f3] to-[#f0fbfa] rounded-2xl p-8 lg:p-12 border border-[#cfe8e6] dark:from-[#1A1A2E] dark:to-[#1A1A2E] dark:border-[#2D2D4A]">
  <div className="grid lg:grid-cols-3 gap-6 items-center">
    
    
    <div className="lg:col-span-2">
      <h3 className="text-2xl sm:text-3xl font-bold text-dark mb-4 dark:text-[#E2E8F0]">
        Seamless Integration Across All Platforms
      </h3>

      <p className="text-slate-600 text-base sm:text-lg leading-relaxed dark:text-[#B0B8C8]">
        All modules share a single database ensuring real-time synchronization.
        Changes made in one module instantly reflect across all others.
      </p>

      
     <div className="mt-6 flex flex-wrap gap-3">
  {[
    "Real-time Sync",
    "Single Sign-On",
    "Unified Database",
    "API Access",
    "Auto Backup",
    "SSL Security",
  ].map((tag, i) => (
    <div
      key={i}
      className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-[#cfe8e6] bg-[#f0fbfa] text-[#0d5c63] text-sm font-semibold shadow-sm cursor-pointer
      transition-all duration-300 ease-out
      hover:-translate-y-1 hover:shadow-lg hover:shadow-[#0d5c63]/25 hover:border-[#0d5c63]/40 hover:bg-white
      dark:bg-[#252540] dark:border-[#2D2D4A] dark:text-[#0d5c63] dark:hover:bg-[#2D3548]"
    >
      
      <div className="flex items-center justify-center h-5 w-5 rounded-md bg-[#0d5c63]/10 transition-all duration-300 group-hover:bg-[#0d5c63]/20">
        <CheckCircle2 className="h-3.5 w-3.5 text-[#0d5c63] transition-transform duration-300 group-hover:scale-110" />
      </div>

      
      <span className="transition-colors duration-300 group-hover:text-dark">
        {tag}
      </span>
    </div>
  ))}
</div>
    </div>

    
    <div className="text-center lg:text-right">
      <Link
        to="/contact"
        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0d5c63] to-[#1b7f8e] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
      >
        View Platform Features
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>

  </div>
</div>

  </div>
</section>
  );
}

export default ProductEcosystem;
