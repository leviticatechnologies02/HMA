// /**
//  * Features section showcasing StayEase's key benefits.
//  */

// export function FeaturesSection() {
//   const features = [
//     {
//       icon: "🏠",
//       title: "Verified Hostels",
//       description: "All hostels are personally verified for quality, safety, and amenities. No surprises, only trusted accommodations.",
//       color: "from-blue-500 to-cyan-500"
//     },
//     {
//       icon: "💰",
//       title: "Best Price Guarantee",
//       description: "Get the best prices with no hidden charges. Compare multiple hostels and choose what fits your budget.",
//       color: "from-green-500 to-emerald-500"
//     },
//     {
//       icon: "🔒",
//       title: "Secure Booking",
//       description: "Book with confidence using our secure payment system. Your transactions and data are always protected.",
//       color: "from-purple-500 to-pink-500"
//     },
//     {
//       icon: "📱",
//       title: "24/7 Support",
//       description: "Round-the-clock customer support to assist you with any queries or issues during your stay.",
//       color: "from-orange-500 to-red-500"
//     },
//     {
//       icon: "✨",
//       title: "Premium Amenities",
//       description: "Access to hostels with modern amenities like WiFi, laundry, study rooms, gym, and more.",
//       color: "from-indigo-500 to-blue-500"
//     },
//     {
//       icon: "🎯",
//       title: "Easy Process",
//       description: "Simple 3-step booking process. Search, book, and move in - all completed within minutes.",
//       color: "from-yellow-500 to-orange-500"
//     }
//   ];

//   return (
//     <section className="py-20 bg-gray-50">
//       <div className="container mx-auto px-4">
//         {/* Section Header */}
//         <div className="text-center max-w-3xl mx-auto mb-16">
//           <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
//             Why Choose StayEase?
//           </h2>
//           <p className="text-xl text-gray-600">
//             We make hostel booking simple, safe, and stress-free
//           </p>
//         </div>

//         {/* Features Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {features.map((feature, index) => (
//             <div
//               key={index}
//               className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//             >
//               {/* Icon */}
//               <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl mb-6`}>
//                 {feature.icon}
//               </div>

//               {/* Title */}
//               <h3 className="text-2xl font-bold text-gray-900 mb-3">
//                 {feature.title}
//               </h3>

//               {/* Description */}
//               <p className="text-gray-600 leading-relaxed">
//                 {feature.description}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
