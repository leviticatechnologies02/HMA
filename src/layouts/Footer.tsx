import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-dark text-slate-400  mb-16 md:mb-0">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                                <Home className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-heading font-bold text-white">
                                Hostel<span className="text-primary">Hub</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed">
                            India's trusted hostel booking platform. Day-wise and monthly bookings with bed-level control.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/hostels" className="hover:text-white transition-colors">Find Hostels</Link></li>
                            <li><Link to="/calculator" className="hover:text-white transition-colors">Rent Calculator</Link></li>
                            <li><Link to="/aboutus" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
                            <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                            <li><Link to="/hostels/map" className="hover:text-white transition-colors">Find Hostels on Map</Link></li>

                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Top Cities</h4>
                        <ul className="space-y-2 text-sm">
                            {["Hyderabad", "Bangalore", "Mumbai", "Pune", "Delhi", "Chennai"].map(c => (
                                <li key={c}><Link to={`/hostels?city=${c}`} className="hover:text-white transition-colors">{c}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li>
                                <button
                                    onClick={() => {
                                        if (window.location.pathname === "/contact") {
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        } else {
                                            window.location.href = "/contact";
                                        }
                                    }}
                                    className="hover:text-white transition-colors cursor-pointer bg-none border-none p-0"
                                >
                                    Contact Us
                                </button>
                            </li>
                            <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                {/* App Download */}
                <div className="border-t border-white/10 mt-12 pt-10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                            <p className="text-white font-semibold text-base mb-1">Get the HostelHub by Levitica Technologies</p>
                            <p className="text-slate-400 text-sm">Book hostels on the go — available on Android & iOS</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Google Play */}
                            <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 transition-all duration-200 group"
                                aria-label="Download on Google Play"
                            >
                                <svg viewBox="0 0 24 24" className="w-7 h-7 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.18 1.07C2.76 1.5 2.5 2.17 2.5 3.04v17.92c0 .87.26 1.54.68 1.97l.1.09 10.04-10.04v-.24L3.28.98l-.1.09z" fill="#EA4335" />
                                    <path d="M16.67 16.32l-3.35-3.35v-.24l3.35-3.35.08.04 3.97 2.26c1.13.64 1.13 1.69 0 2.34l-3.97 2.26-.08.04z" fill="#FBBC04" />
                                    <path d="M16.75 16.28L13.32 12.84 3.18 22.97c.37.4.98.44 1.67.05l11.9-6.74" fill="#34A853" />
                                    <path d="M16.75 7.72L4.85 1c-.69-.4-1.3-.36-1.67.05L13.32 11.16l3.43-3.44z" fill="#4285F4" />
                                </svg>
                                <div className="text-left">
                                    <p className="text-white/50 text-[10px] leading-none">GET IT ON</p>
                                    <p className="text-white font-semibold text-sm leading-tight mt-0.5">Google Play</p>
                                </div>
                            </a>

                            {/* App Store */}
                            <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 transition-all duration-200 group"
                                aria-label="Download on the App Store"
                            >
                                <svg viewBox="0 0 24 24" className="w-7 h-7 shrink-0" fill="white" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                <div className="text-left">
                                    <p className="text-white/50 text-[10px] leading-none">DOWNLOAD ON THE</p>
                                    <p className="text-white font-semibold text-sm leading-tight mt-0.5">App Store</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm">&copy; 2026 StayEase. All rights reserved.</p>
                    <p className="text-sm">Built for students, by people who care.</p>
                </div>
            </div>
        </footer>
    );
}   