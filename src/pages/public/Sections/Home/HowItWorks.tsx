import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, CalendarCheck, TrendingUp, ArrowRight } from "lucide-react";

function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Complete Registration",
      desc: "Create your account and set up your hostel profile in minutes",
      icon: UserPlus,
    },
    {
      title: "Manage Bookings",
      desc: "Accept bookings, manage check-ins, and track occupancy in real-time",
      icon: CalendarCheck,
    },
    {
      title: "Grow Your Business",
      desc: "Use analytics to optimize operations and enhance resident experience",
      icon: TrendingUp,
    },
  ];
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-neutral px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark mb-4">
            Simple Implementation <span className="bg-gradient-to-r from-[#0d5c63] to-[#1b7f8e] bg-clip-text text-transparent"> Process </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get your hostel management system operational in three straightforward steps
          </p>
        </div>

        
        <div className="relative">
          
          
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-[#e6f4f3] rounded-full">
            <motion.div
              className="h-full bg-gradient-to-r from-[#0d5c63] to-[#1b7f8e] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;

              return (
                <div
                  key={index}
                  className="relative flex flex-col items-center cursor-pointer"
                  onClick={() => setActiveStep(index)}
                >

                  
                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      boxShadow: isActive
                        ? "0 20px 40px rgba(13,92,99,0.25)"
                        : "0 8px 20px rgba(0,0,0,0.08)",
                    }}
                    className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-br from-[#0d5c63] to-[#1b7f8e]"
                        : "bg-[#e6f4f3]"
                    }`}
                  >
                    <Icon
                      className={`w-10 h-10 ${
                        isActive ? "text-white" : "text-[#0d5c63]"
                      }`}
                    />
                  </motion.div>

                  
                  <div className="text-center">
                    <h3
                      className={`text-xl font-semibold mb-3 transition ${
                        isActive ? "text-[#0d5c63]" : "text-dark"
                      }`}
                    >
                      {step.title}
                    </h3>

                    <p className="text-slate-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  
                  <div className="mt-6 text-sm font-semibold text-[#0d5c63]">
                    STEP 0{index + 1}
                  </div>

                </div>
              );
            })}
          </div>

          
          <div className="lg:hidden flex justify-center items-center gap-4 mt-10">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition ${
                  index <= activeStep ? "bg-[#0d5c63]" : "bg-[#cfe8e6]"
                }`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

export default HowItWorks;
