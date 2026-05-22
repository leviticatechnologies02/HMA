import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, MessageCircle, ChevronDown, User, Building2, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

const contactSchema = z.object({
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .refine(
      (name) => /^[a-zA-Z\s\-]*$/.test(name),
      "First name can only contain letters, spaces, and hyphens"
    ),
  lastName: z.string()
    .max(50, "Last name must not exceed 50 characters")
    .refine(
      (name) => name === "" || /^[a-zA-Z\s\-]*$/.test(name),
      "Last name can only contain letters, spaces, and hyphens"
    ),
  email: z.string()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .max(100, "Email must not exceed 100 characters")
    .refine(
      (email) => {
        // Stricter email validation - must have proper TLD (2-6 characters)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
        return emailRegex.test(email);
      },
      "Enter a valid email address (e.g., name@example.com)"
    ),
  company: z.string()
    .max(100, "Organization name must not exceed 100 characters")
    .refine(
      (company) => company === "" || /^[a-zA-Z0-9\s\-&.]*$/.test(company),
      "Organization name can only contain letters, numbers, spaces, hyphens, dots, and ampersands"
    ),
  phone: z.string()
    .refine(
      (phone) => phone === "" || /^[0-9\s\-+()]{10,15}$/.test(phone),
      "Phone must contain at least 10 digits (allow spaces, hyphens, +, parentheses)"
    )
    .optional()
    .or(z.literal("")),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must not exceed 1000 characters")
    .refine(
      (msg) => msg.trim().length > 0,
      "Message cannot be only spaces"
    ),
});

type ContactValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const [status, setStatus] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema)
  });

  const faqItems = [
    { id: 1, question: "What is HostelMS?", answer: "HostelMS is a comprehensive hostel management system designed to streamline operations, manage bookings, automate billing, track maintenance, and improve communication between staff and residents." },
    { id: 2, question: "How can HostelMS help my hostel?", answer: "Our platform helps reduce administrative overhead, minimize errors, improve resident satisfaction, and provide real-time insights into your hostel operations with an intuitive dashboard." },
    { id: 3, question: "Is there a free trial available?", answer: "Yes! We offer a 14-day free trial for all new customers. No credit card required. Experience all features with your complete hostel data." },
    { id: 4, question: "What support do you provide?", answer: "We provide 24/7 customer support via email, phone, and live chat. Our team is always ready to help with any questions or issues you might encounter." },
    { id: 5, question: "Can I integrate HostelMS with my existing systems?", answer: "Absolutely! HostelMS integrates seamlessly with popular accounting software, payment gateways, and communication platforms to enhance your workflow." },
    { id: 6, question: "What about data security and privacy?", answer: "We prioritize your data security with enterprise-grade encryption, regular backups, GDPR compliance, and strict access controls to protect your sensitive information." }
  ];

  const onSubmit = async (values: ContactValues) => {
    try {
      console.log("Form submitted:", values);
      toast.success("Message sent successfully! We'll get back to you within 24 hours.");
      reset();
      setStatus("Message sent successfully! We'll get back to you within 24 hours.");
      setTimeout(() => setStatus(""), 4000);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
      setStatus("Failed to send message. Please try again.");
    }
  };

  return (
    
      <div className="min-h-screen bg-gradient-to-b from-neutral via-white to-neutral dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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
                  24/7 Support Available
                </span>
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
                Contact{" "}
                <span className="text-accent">
                  HostelMS
                </span>
              </h1>

              <p className="mx-auto max-w-3xl text-lg leading-relaxed text-white/90 drop-shadow-md sm:text-xl">
                Reach out for bookings, onboarding help, product support, or a personalized walkthrough of how HostelMS can simplify your property management.
              </p>

              <div className="mx-auto grid max-w-3xl gap-4 py-2 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/30 bg-white/14 p-4 text-white backdrop-blur-sm">
                  <p className="text-sm font-semibold">Fast replies</p>
                  <p className="mt-1 text-sm text-white/75">Response within 24 hours</p>
                </div>
                <div className="rounded-2xl border border-white/30 bg-white/14 p-4 text-white backdrop-blur-sm">
                  <p className="text-sm font-semibold">Expert team</p>
                  <p className="mt-1 text-sm text-white/75">Product and onboarding support</p>
                </div>
                <div className="rounded-2xl border border-white/30 bg-white/14 p-4 text-white backdrop-blur-sm">
                  <p className="text-sm font-semibold">Free consult</p>
                  <p className="mt-1 text-sm text-white/75">Tailored demo for your hostel</p>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row">
                <a
                  href="#contact-form"
                  className="btn-primary"
                >
                  Contact Us
                </a>
                <Link to="/register">

                  <button className="rounded-xl border-2 border-white px-8 py-3.5 font-semibold text-white transition hover:bg-white/20 backdrop-blur-sm">
                    Request Demo
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 px-4 bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="mb-3 text-3xl font-bold tracking-tight text-dark dark:text-white sm:text-4xl md:text-5xl">
                Quick Contact Options
              </h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Choose your preferred way to connect with us
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm hover:shadow-lg dark:hover:shadow-lg/30 transition-all duration-300 hover:-translate-y-2">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 transition-transform duration-300 group-hover:scale-110">
                  <Phone className="text-2xl text-primary" />
                </div>
                <h3 className="mb-3 text-2xl font-bold tracking-tight text-dark dark:text-white">Call Us</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Speak directly with our support team for immediate assistance with bookings or technical issues.
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+918008682560"
                    className="group/btn flex items-center justify-between rounded-xl bg-primary/10 dark:bg-primary/20 px-5 py-3 font-semibold text-primary transition-colors hover:bg-primary/20 dark:hover:bg-primary/30"
                  >
                    <span>+91 8008682560</span>
                    <Phone className="group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                  <a
                    href="https://wa.me/918008682560"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-accent/10 px-5 py-3 font-semibold text-accent transition-colors hover:bg-accent/20"
                  >
                    <MessageCircle className="text-lg" />
                    <span>Message on WhatsApp</span>
                  </a>
                </div>
              </div>

              <div className="group rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm hover:shadow-lg dark:hover:shadow-lg/30 transition-all duration-300 hover:-translate-y-2">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 transition-transform duration-300 group-hover:scale-110">
                  <Mail className="text-2xl text-primary" />
                </div>
                <h3 className="mb-3 text-2xl font-bold tracking-tight text-dark dark:text-white">Email Us</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Send us detailed queries and we'll respond with comprehensive solutions within 24 hours.
                </p>
                <a
                  href="mailto:hr@learning.designcareermetrics.com"
                  className="group/btn flex items-center justify-between rounded-xl bg-primary/10 dark:bg-primary/20 px-5 py-3 font-semibold text-primary transition-colors hover:bg-primary/20 dark:hover:bg-primary/30"
                >
                  <span className="truncate">hr@leviticatechnologies.com</span>
                  <Mail className="group-hover/btn:translate-x-1 transition-transform" />
                </a>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 text-center">
                  Response time: Within 24 hours
                </p>
              </div>

              <div className="group rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm hover:shadow-lg dark:hover:shadow-lg/30 transition-all duration-300 hover:-translate-y-2">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-accent/10 dark:bg-accent/20 transition-transform duration-300 group-hover:scale-110">
                  <MapPin className="text-2xl text-accent" />
                </div>
                <h3 className="mb-3 text-2xl font-bold tracking-tight text-dark dark:text-white">Visit Us</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Our office is located in Hyderabad. Schedule a visit for a detailed demo of our hostel solutions.
                </p>
                <div className="mb-4 rounded-xl bg-slate-50 dark:bg-slate-700 p-4">
                  <p className="text-dark dark:text-white font-medium">
                    Levitica Technologies Pvt Ltd<br />
                    Hyderabad, Telangana, India
                  </p>
                </div>
                <a
                  href="https://www.google.com/maps/place/Design+Career+Metrics+Pvt+Ltd/@17.4579659,78.4237526,12z/data=!4m6!3m5!1s0x3bcb910838be5b35:0xfa8c53166a450046!8m2!3d17.4579659!4d78.5053877!16s%2Fg%2F11rw2sypv9?entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-accent/10 dark:bg-accent/20 px-5 py-3 font-semibold text-accent transition-colors hover:bg-accent/20 dark:hover:bg-accent/30"
                >
                  <MapPin />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="contact-form" className="px-6 py-12 sm:py-16 lg:px-8">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl shadow-2xl lg:grid-cols-[1fr_0.9fr] lg:items-stretch">

            <div className="bg-white dark:bg-slate-800 p-10 text-slate-900 dark:text-white lg:p-14">

              <h2 className="mb-3 text-3xl font-bold tracking-tight text-dark dark:text-white sm:text-4xl lg:text-5xl">
                Let's <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">work together</span>
              </h2>
              <p className="mb-10 text-slate-600 dark:text-slate-300">
                Transform your hostel operations with our comprehensive management solution. Contact us for a personalized demo and consultation.
              </p>

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-dark dark:text-slate-200">First name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input
                        {...register("firstName")}
                        type="text"
                        placeholder="Enter your first name"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!/^[a-zA-Z\s\-]*$/.test(value) && value !== "") {
                            e.target.value = value.replace(/[^a-zA-Z\s\-]/g, '');
                          }
                        }}
                        className={`input-field pl-10 ${errors.firstName ? "border-red-500 dark:border-red-400" : ""}`}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-dark dark:text-slate-200">Last name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      <input
                        {...register("lastName")}
                        type="text"
                        placeholder="Enter your last name"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!/^[a-zA-Z\s\-]*$/.test(value) && value !== "") {
                            e.target.value = value.replace(/[^a-zA-Z\s\-]/g, '');
                          }
                        }}
                        className="input-field pl-10"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-dark dark:text-slate-200">Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="you@example.com"
                      className={`input-field pl-10 ${errors.email ? "border-red-500 dark:border-red-400" : ""}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-dark dark:text-slate-200">Hostel/Organization Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      {...register("company")}
                      type="text"
                      placeholder="Enter hostel or organization name"
                      className="input-field pl-10"
                    />
                  </div>
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.company.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-dark dark:text-slate-200">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      {...register("phone")}
                      type="tel"
                      placeholder="e.g., +91 9876543210"
                      className={`input-field pl-10 ${errors.phone ? "border-red-500 dark:border-red-400" : ""}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-dark dark:text-slate-200">
                    How can we help you? <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-slate-400 pointer-events-none" />
                    <textarea
                      {...register("message")}
                      rows={4}
                      placeholder="Tell us about your inquiry or requirements..."
                      className={`input-field resize-none pl-10 ${errors.message ? "border-red-500 dark:border-red-400" : ""}`}
                    ></textarea>
                  </div>
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message.message}</p>
                  )}
                </div>
                {status && (
                  <div className={`rounded-xl border p-4 ${status.includes("successfully") ? "border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "border-primary/30 dark:border-primary/50 bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary/90"}`}>
                    {status}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center btn-primary dark:hover:bg-primary/80"
                  >
                    Send message
                  </button>
                </div>

              </form>
            </div>

            <div className="hidden h-full flex-col bg-gradient-to-br from-slate-50 dark:from-slate-800 to-white dark:to-slate-900 p-8 lg:flex lg:p-10">
              <div className="mb-6 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-700/50 px-6 py-6 text-center shadow-sm backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary dark:text-primary/90">
                  Our Location
                </p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-dark dark:text-white xl:text-3xl">
                  Levitica Technologies Pvt Ltd
                </h3>
                <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-primary to-primary/50" />
                <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-slate-600 dark:text-slate-300">
                  Hyderabad, Telangana, India
                </p>
              </div>

              <div className="mt-4 flex-1 flex items-center">
                <div className="w-full overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
                  <iframe
                    title="Levitica Technologies Location"
                    className="h-[380px] w-full border-0 xl:h-[430px]"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.331292031365!2d78.38304587540443!3d17.443850583452964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x873dde7736fdeff1%3A0x88d3af212bf885bc!2sLevitica%20Technologies%20PVT%20LTD!5e0!3m2!1sen!2sin!4v1774860090227!5m2!1sen!2sinhttps://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.331292031365!2d78.38304587540443!3d17.443850583452964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x873dde7736fdeff1%3A0x88d3af212bf885bc!2sLevitica%20Technologies%20PVT%20LTD!5e0!3m2!1sen!2sin!4v1774860090227!5m2!1sen!2sin"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <a
                  href="https://www.google.com/maps/place/Design+Career+Metrics+Pvt+Ltd/@17.4579659,78.4237526,12z/data=!4m6!3m5!1s0x3bcb910838be5b35:0xfa8c53166a450046!8m2!3d17.4579659!4d78.5053877!16s%2Fg%2F11rw2sypv9?entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl btn-primary dark:hover:bg-primary/80"
                >
                  <MapPin />
                  <span>Get Directions</span>
                </a>
                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                  ✓ Response within 24 hours
                </p>
              </div>
            </div>

          </div>



        </section>

        <section className="bg-gradient-to-b from-white dark:from-slate-900 to-slate-50 dark:to-slate-800 px-4 py-14 ">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 dark:border-primary/40 bg-primary/5 dark:bg-primary/10 px-6 py-3">
                <span className="text-2xl">❓</span>
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-sm font-semibold text-transparent">Frequently Asked Questions</span>
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-dark dark:text-white sm:text-4xl md:text-5xl">
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Got Questions?
                </span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Find answers to common questions about HostelMS and how it can transform your hostel operations.
              </p>
            </div>

            <div className="space-y-3">
              {faqItems.map((item) => (
                <div
                  key={item.id}
                  className="group overflow-hidden rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm dark:shadow-lg transition-all duration-300 hover:shadow-md dark:hover:shadow-xl"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
                    className="flex w-full items-center justify-between bg-white dark:bg-slate-800 px-7 py-5 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <span className="text-lg font-semibold text-dark dark:text-white text-left">
                      {item.question}
                    </span>
                    <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 transition-transform group-hover:scale-110 ${expandedFAQ === item.id ? 'rotate-180' : ''}`}>
                      <ChevronDown className="h-4 w-4 text-primary dark:text-primary/90" />
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${expandedFAQ === item.id ? 'max-h-48' : 'max-h-0'
                      }`}
                  >
                    <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-7 py-5">
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl bg-gradient-to-r from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70 p-8 text-center text-white md:p-12">
              <h3 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl">Still have questions?</h3>
              <p className="mb-6 text-white/90">Get in touch with our team and we'll help you find the perfect solution for your hostel.</p>
              <a href="#contact-form" className="inline-flex rounded-xl bg-white dark:bg-slate-100 px-8 py-3.5 font-semibold text-primary transition-colors duration-300 hover:bg-slate-50 dark:hover:bg-white">
                Contact Our Team
              </a>
            </div>
          </div>
        </section>
      </div>
   
  );
}
