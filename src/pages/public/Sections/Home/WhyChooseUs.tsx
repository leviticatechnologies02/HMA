import React from "react";
import { ShieldCheck, Zap, Headphones, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function WhyChooseUs() {
  const whyChoose = [
    {
      title: "Enterprise-Grade Security",
      desc: "Protect sensitive hostel data with military-grade encryption, role-based access controls, and automated backups.",
      icon: ShieldCheck,
      features: [
        "Bank-level data encryption",
        "Role-based access for staff",
        "Automatic daily backups",
        "GDPR & FERPA compliant"
      ],
      color: "from-[#0d5c63] to-[#1b7f8e]",
      shadow: "shadow-[#0d5c63]/20",
      accentColor: "bg-[#0d5c63]",
      learnMoreLink: "/features"
    },
    {
      title: "Automated Operations",
      desc: "Streamline hostel management with intelligent automation for admissions, payments, maintenance, and communications.",
      icon: Zap,
      features: [
        "Automated rent collection",
        "Smart room allocation",
        "Maintenance workflow automation",
        "Bulk notice broadcasting"
      ],
      color: "from-[#0d5c63] to-[#1b7f8e]",
      shadow: "shadow-[#0d5c63]/20",
      accentColor: "bg-[#1b7f8e]",
      learnMoreLink: "/features"
    },
    {
      title: "Dedicated Support",
      desc: "Get round-the-clock assistance with dedicated account managers and comprehensive training for your staff.",
      icon: Headphones,
      features: [
        "24/7 priority helpline",
        "Onboarding training sessions",
        "Quarterly system reviews",
        "Emergency response team"
      ],
      color: "from-[#0d5c63] to-[#1b7f8e]",
      shadow: "shadow-[#0d5c63]/20",
      accentColor: "bg-[#7fcac3]",
      learnMoreLink: "/features"
    },
  ];

  return (
    <section className="py-16 bg-neutral relative overflow-hidden px-4 sm:px-6 lg:px-8">
      
      
     
   
      
      <div className="mx-auto max-w-7xl relative z-10">

        
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-[#e6f4f3] text-[#0d5c63] px-5 py-2 rounded-full text-sm font-semibold mb-6">
            WHY CHOOSE OUR PLATFORM
          </span>

          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-dark mb-6">
            Built Specifically for{" "}
            <span className="bg-gradient-to-r from-[#0d5c63] to-[#1b7f8e] bg-clip-text text-transparent">
              Hostel Management
            </span>
          </h2>

          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Designed with insights from 100+ educational institutions. Our platform eliminates manual work, reduces errors, and provides complete transparency.
          </p>
        </div>

        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {whyChoose.map((item, index) => {
            const Icon = item.icon;

            return (
              <div key={index} className="group relative">
                
                
                <div className="absolute inset-0 bg-gradient-to-r from-[#e6f4f3] to-[#f0fbfa] rounded-3xl blur-md opacity-0 group-hover:opacity-60 transition duration-500"></div>

                
                <div className="relative bg-white rounded-3xl p-8 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2 h-full flex flex-col dark:bg-[#1A1A2E] dark:border-[#2D2D4A] dark:text-[#E2E8F0]">

                  
                  <div className="relative mb-8">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-2xl opacity-10 group-hover:opacity-20 blur-sm`}></div>

                    <div className={`relative w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center ${item.shadow}`}>
                      <Icon className="text-white" size={30} />
                    </div>
                  </div>

                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-dark mb-4 group-hover:text-[#0d5c63] transition">
                      {item.title}
                    </h3>

                    <p className="text-slate-600 mb-6 dark:text-[#B0B8C8]">
                      {item.desc}
                    </p>

                    
                    <div className="space-y-3 mb-6">
                      {item.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`w-5 h-5 ${item.accentColor} rounded-full flex items-center justify-center mt-0.5`}>
                            <CheckCircle className="text-white" size={12} />
                          </div>
                          <span className="text-slate-700 text-sm dark:text-[#B0B8C8]">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-[#0d5c63] opacity-0 group-hover:opacity-100 transition"></div>
                </div>
              </div>
            );
          })}
        </div>

        
        <div className="mt-10 text-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#0d5c63] to-[#1b7f8e] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition hover:-translate-y-1"
          >
            <Zap size={20} />
            Request a Personalized Demo
            <ArrowRight size={18} />
          </Link>

          <p className="text-slate-500 mt-3 text-sm">
            See how our platform can transform your hostel operations
          </p>
        </div>

      </div>
    </section>
  );
}

export default WhyChooseUs;
