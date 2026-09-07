// 'use client';
// import React, { useState } from 'react';

// const Contact = () => {
//   const [name, setname] = useState('');
//   const [phone_number, setphone_number] = useState('');
//   const [email, setemail] = useState('');
//   const [message, setmessage] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     try {
//       const payload = {
//         "name": name,
//         "phone_number": phone_number,
//         "email": email,
//         "message": message
//       };
      
//       // Replace this with your actual AxiosInstance call:
//       // const response = await AxiosInstance.post('/ecommerce/contact', payload, {
//       //   headers: { 'Content-Type': 'application/json' }
//       // });
      
//       // Simulated API call for demo
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       console.log('Response:', payload);
//       setname('');
//       setphone_number('');
//       setemail('');
//       setmessage('');
      
//       alert('Message sent successfully!');
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Failed to send message. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="relative min-h-screen bg-gradient-to-b from-[#fdfaf6] via-[#f9f6f1] to-[#f7f3ec] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
//       {/* Decorative background elements */}
//       <div className="absolute top-20 left-10 w-40 h-40 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
//       <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#e8c547]/5 rounded-full blur-3xl"></div>
//       <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-[#d4af37]/3 rounded-full blur-2xl"></div>

//       <div className="relative max-w-2xl w-full">
//         {/* Header Section */}
//         <div className="text-center mb-12 animate-fadeIn">
//           <div className="flex items-center justify-center gap-3 mb-4">
//             <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
//             <span className="text-[#d4af37] text-xs font-semibold tracking-[0.3em] uppercase">
//               Get In Touch
//             </span>
//             <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
//           </div>
          
//           <h2 className="text-5xl md:text-6xl font-serif font-bold text-[#2a1f0f] mb-4 animate-slideUp">
//             Contact Us
//           </h2>
          
//           <p className="text-lg md:text-xl text-gray-600 font-light max-w-xl mx-auto animate-fadeInDelay">
//             We&apos;d love to hear from you! Share your thoughts and we&apos;ll get back to you soon.
//           </p>
//         </div>

//         {/* Form Card */}
//         <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl border border-[#e6d5b8]/50 shadow-[0_10px_60px_rgba(212,175,55,0.12)] p-8 md:p-12 animate-fadeInDelay2">
//           {/* Top corner accents */}
//           <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#d4af37]/30 rounded-tr-2xl"></div>
//           <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[#d4af37]/30 rounded-bl-2xl"></div>

//           <div className="space-y-6 relative z-10">
//             {/* Name Field */}
//             <div className="group">
//               <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
//                 Full Name
//               </label>
//               <input
//                 id="name"
//                 name="name"
//                 type="text"
//                 required
//                 value={name}
//                 onChange={e => setname(e.target.value)}
//                 className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all duration-300 bg-white/50"
//                 placeholder="Enter your full name"
//               />
//             </div>

//             {/* Email Field */}
//             <div className="group">
//               <label htmlFor="email-address" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
//                 Email Address
//               </label>
//               <input
//                 id="email-address"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 value={email}
//                 onChange={e => setemail(e.target.value)}
//                 className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all duration-300 bg-white/50"
//                 placeholder="your.email@example.com"
//               />
//             </div>

//             {/* Phone Field */}
//             <div className="group">
//               <label htmlFor="phone-number" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
//                 Phone Number
//               </label>
//               <input
//                 id="phone-number"
//                 name="phone"
//                 type="tel"
//                 autoComplete="tel"
//                 required
//                 value={phone_number}
//                 onChange={e => setphone_number(e.target.value)}
//                 className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all duration-300 bg-white/50"
//                 placeholder="+1 (555) 000-0000"
//               />
//             </div>

//             {/* Message Field */}
//             <div className="group">
//               <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
//                 Your Message
//               </label>
//               <textarea
//                 id="message"
//                 name="message"
//                 rows="5"
//                 required
//                 value={message}
//                 onChange={e => setmessage(e.target.value)}
//                 className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition-all duration-300 resize-none bg-white/50"
//                 placeholder="Tell us what's on your mind..."
//               ></textarea>
//             </div>

//             {/* Submit Button */}
//             <div className="pt-4">
//               <button
//                 onClick={handleSubmit}
//                 disabled={isSubmitting}
//                 className="group/btn relative w-full px-8 py-4 bg-gradient-to-r from-[#d4af37] via-[#e8c547] to-[#d4af37] text-black font-semibold text-lg rounded-xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//               >
//                 <span className="relative z-10 flex items-center justify-center gap-2">
//                   {isSubmitting ? (
//                     <>
//                       <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Sending...
//                     </>
//                   ) : (
//                     <>
//                       Send Message
//                       <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
//                       </svg>
//                     </>
//                   )}
//                 </span>
//                 <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity duration-500"></div>
//               </button>
//             </div>
//           </div>

//           {/* Bottom decorative element */}
//           <div className="absolute bottom-8 right-8 flex items-center gap-2 opacity-20">
//             <div className="w-2 h-2 rounded-full bg-[#d4af37]"></div>
//             <div className="w-2 h-2 rounded-full bg-[#e8c547]"></div>
//             <div className="w-2 h-2 rounded-full bg-[#d4af37]"></div>
//           </div>
//         </div>

//         {/* Footer decoration */}
//         <div className="mt-12 relative flex justify-center">
//           <div className="w-64 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-pulse-slow"></div>
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-br from-[#d4af37] to-[#e8c547] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.8)]"></div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes slideUp {
//           0% {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           100% {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         @keyframes fadeIn {
//           0% {
//             opacity: 0;
//           }
//           100% {
//             opacity: 1;
//           }
//         }
//         @keyframes pulseSlow {
//           0%, 100% {
//             opacity: 0.4;
//           }
//           50% {
//             opacity: 1;
//           }
//         }
//         .animate-slideUp {
//           animation: slideUp 1s ease-out forwards;
//         }
//         .animate-fadeIn {
//           animation: fadeIn 1.2s ease-in forwards;
//         }
//         .animate-fadeInDelay {
//           animation: fadeIn 1.5s ease-in 0.3s forwards;
//           opacity: 0;
//         }
//         .animate-fadeInDelay2 {
//           animation: fadeIn 1.5s ease-in 0.5s forwards;
//           opacity: 0;
//         }
//         .animate-pulse-slow {
//           animation: pulseSlow 3s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Contact;





// 'use client';
// import React, { useState } from 'react';

// const Contact = () => {
//   const [name, setname] = useState('');
//   const [phone_number, setphone_number] = useState('');
//   const [email, setemail] = useState('');
//   const [message, setmessage] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     try {
//       const payload = {
//         "name": name,
//         "phone_number": phone_number,
//         "email": email,
//         "message": message
//       };
      
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       console.log('Response:', payload);
//       setname('');
//       setphone_number('');
//       setemail('');
//       setmessage('');
      
//       alert('Message sent successfully!');
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Failed to send message. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="relative min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
//       {/* Animated background elements */}
//       <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-3xl animate-float"></div>
//       <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-yellow-200/30 to-amber-200/30 rounded-full blur-3xl animate-float-delayed"></div>
//       <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-br from-orange-200/20 to-amber-200/20 rounded-full blur-2xl animate-float-slow"></div>
//       <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-2xl animate-float-delayed"></div>

//       <div className="relative max-w-2xl w-full">
//         {/* Header Section */}
//         <div className="text-center mb-12 animate-fadeIn">
//           <div className="flex items-center justify-center gap-3 mb-6">
//             <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
//             <span className="text-amber-600 text-xs font-bold tracking-[0.4em] uppercase">
//               Get In Touch
//             </span>
//             <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
//           </div>
          
//           <h2 className="text-6xl md:text-7xl font-serif font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent mb-6 animate-slideUp">
//             Contact Us
//           </h2>
          
//           <p className="text-xl md:text-2xl text-gray-600 font-light max-w-xl mx-auto animate-fadeInDelay leading-relaxed">
//             We'd love to hear from you! Share your thoughts and we'll get back to you soon.
//           </p>
//         </div>

//         {/* Form Card */}
//         <div className="relative bg-white/80 backdrop-blur-2xl rounded-3xl border-2 border-amber-200/50 shadow-[0_20px_80px_rgba(251,191,36,0.15)] p-10 md:p-14 animate-fadeInDelay2 hover:shadow-[0_20px_100px_rgba(251,191,36,0.25)] transition-shadow duration-500">
//           {/* Corner decorations */}
//           <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full opacity-20 blur-xl"></div>
//           <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-yellow-300 to-amber-300 rounded-full opacity-20 blur-xl"></div>
          
//           {/* Top corner accents */}
//           <div className="absolute top-0 right-0 w-24 h-24 border-t-3 border-r-3 border-amber-300/40 rounded-tr-3xl"></div>
//           <div className="absolute bottom-0 left-0 w-24 h-24 border-b-3 border-l-3 border-orange-300/40 rounded-bl-3xl"></div>

//           <div className="space-y-7 relative z-10">
//             {/* Name Field */}
//             <div className="group">
//               <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-3 ml-1 flex items-center gap-2">
//                 <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
//                 Full Name
//               </label>
//               <input
//                 id="name"
//                 name="name"
//                 type="text"
//                 required
//                 value={name}
//                 onChange={e => setname(e.target.value)}
//                 className="w-full px-6 py-4 border-2 border-amber-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 bg-gradient-to-br from-white to-amber-50/30 hover:border-amber-300"
//                 placeholder="Enter your full name"
//               />
//             </div>

//             {/* Email Field */}
//             <div className="group">
//               <label htmlFor="email-address" className="block text-sm font-bold text-gray-700 mb-3 ml-1 flex items-center gap-2">
//                 <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
//                 Email Address
//               </label>
//               <input
//                 id="email-address"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 value={email}
//                 onChange={e => setemail(e.target.value)}
//                 className="w-full px-6 py-4 border-2 border-amber-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-200/50 transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30 hover:border-orange-300"
//                 placeholder="your.email@example.com"
//               />
//             </div>

//             {/* Phone Field */}
//             <div className="group">
//               <label htmlFor="phone-number" className="block text-sm font-bold text-gray-700 mb-3 ml-1 flex items-center gap-2">
//                 <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
//                 Phone Number
//               </label>
//               <input
//                 id="phone-number"
//                 name="phone"
//                 type="tel"
//                 autoComplete="tel"
//                 required
//                 value={phone_number}
//                 onChange={e => setphone_number(e.target.value)}
//                 className="w-full px-6 py-4 border-2 border-amber-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-200/50 transition-all duration-300 bg-gradient-to-br from-white to-yellow-50/30 hover:border-yellow-300"
//                 placeholder="+1 (555) 000-0000"
//               />
//             </div>

//             {/* Message Field */}
//             <div className="group">
//               <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-3 ml-1 flex items-center gap-2">
//                 <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
//                 Your Message
//               </label>
//               <textarea
//                 id="message"
//                 name="message"
//                 rows="5"
//                 required
//                 value={message}
//                 onChange={e => setmessage(e.target.value)}
//                 className="w-full px-6 py-4 border-2 border-amber-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-200/50 transition-all duration-300 resize-none bg-gradient-to-br from-white to-amber-50/30 hover:border-amber-300"
//                 placeholder="Tell us what's on your mind..."
//               ></textarea>
//             </div>

//             {/* Submit Button */}
//             <div className="pt-6">
//               <button
//                 onClick={handleSubmit}
//                 disabled={isSubmitting}
//                 className="group/btn relative w-full px-8 py-5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white font-bold text-lg rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_10px_40px_rgba(251,146,60,0.5)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_4px_20px_rgba(251,146,60,0.3)]"
//               >
//                 <span className="relative z-10 flex items-center justify-center gap-3">
//                   {isSubmitting ? (
//                     <>
//                       <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Sending...
//                     </>
//                   ) : (
//                     <>
//                       Send Message
//                       <svg className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
//                       </svg>
//                     </>
//                   )}
//                 </span>
//                 <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-orange-300 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
//               </button>
//             </div>
//           </div>

//           {/* Floating decorative elements */}
//           <div className="absolute top-10 right-10 flex items-center gap-2 opacity-30 animate-float-slow">
//             <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-400"></div>
//             <div className="w-2 h-2 rounded-full bg-gradient-to-br from-yellow-400 to-amber-400"></div>
//             <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-amber-400"></div>
//           </div>
//         </div>

//         {/* Footer decoration */}
//         <div className="mt-16 relative flex justify-center">
//           <div className="w-80 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-pulse-slow"></div>
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-full shadow-[0_0_20px_rgba(251,146,60,0.8)] animate-pulse-glow"></div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes slideUp {
//           0% {
//             opacity: 0;
//             transform: translateY(40px);
//           }
//           100% {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         @keyframes fadeIn {
//           0% {
//             opacity: 0;
//           }
//           100% {
//             opacity: 1;
//           }
//         }
//         @keyframes float {
//           0%, 100% {
//             transform: translateY(0) scale(1);
//           }
//           50% {
//             transform: translateY(-20px) scale(1.05);
//           }
//         }
//         @keyframes floatDelayed {
//           0%, 100% {
//             transform: translateY(0) scale(1);
//           }
//           50% {
//             transform: translateY(-30px) scale(1.08);
//           }
//         }
//         @keyframes floatSlow {
//           0%, 100% {
//             transform: translateY(0) translateX(0);
//           }
//           33% {
//             transform: translateY(-15px) translateX(10px);
//           }
//           66% {
//             transform: translateY(10px) translateX(-10px);
//           }
//         }
//         @keyframes pulseSlow {
//           0%, 100% {
//             opacity: 0.3;
//           }
//           50% {
//             opacity: 1;
//           }
//         }
//         @keyframes pulseGlow {
//           0%, 100% {
//             transform: translate(-50%, -50%) scale(1);
//             opacity: 1;
//           }
//           50% {
//             transform: translate(-50%, -50%) scale(1.3);
//             opacity: 0.7;
//           }
//         }
//         .animate-slideUp {
//           animation: slideUp 1s ease-out forwards;
//         }
//         .animate-fadeIn {
//           animation: fadeIn 1.2s ease-in forwards;
//         }
//         .animate-fadeInDelay {
//           animation: fadeIn 1.5s ease-in 0.3s forwards;
//           opacity: 0;
//         }
//         .animate-fadeInDelay2 {
//           animation: fadeIn 1.5s ease-in 0.5s forwards;
//           opacity: 0;
//         }
//         .animate-float {
//           animation: float 8s ease-in-out infinite;
//         }
//         .animate-float-delayed {
//           animation: floatDelayed 10s ease-in-out infinite;
//         }
//         .animate-float-slow {
//           animation: floatSlow 12s ease-in-out infinite;
//         }
//         .animate-pulse-slow {
//           animation: pulseSlow 3s ease-in-out infinite;
//         }
//         .animate-pulse-glow {
//           animation: pulseGlow 2s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Contact;




'use client';
import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';

const Contact = () => {
  const [name, setname] = useState('');
  const [phone_number, setphone_number] = useState('');
  const [email, setemail] = useState('');
  const [message, setmessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        "name": name,
        "phone_number": phone_number,
        "email": email,
        "message": message
      };
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Response:', payload);
      setname('');
      setphone_number('');
      setemail('');
      setmessage('');
      
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-black mb-4">
            Get In Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question or want to work together? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email Card */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-black transition-colors duration-300 group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaEnvelope className="text-white w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Email</h3>
                  <a href="mailto:contact@goharcollection.com" className="text-gray-600 hover:text-black transition-colors">
                    contact@goharcollection.com
                  </a>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-black transition-colors duration-300 group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaPhone className="text-white w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Phone</h3>
                  <a href="tel:+923331906382" className="text-gray-600 hover:text-black transition-colors">
                    (+92) 333 1906382
                  </a>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-black transition-colors duration-300 group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FaMapMarkerAlt className="text-white w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-600">
                    Sector D, DHA 2<br />
                    Islamabad, Pakistan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={e => setname(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors duration-300"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email-address" className="block text-sm font-medium text-black mb-2">
                      Email Address *
                    </label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={e => setemail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors duration-300"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone-number" className="block text-sm font-medium text-black mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="phone-number"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone_number}
                    onChange={e => setphone_number(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors duration-300"
                    placeholder="+92 300 1234567"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-black mb-2">
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    required
                    value={message}
                    onChange={e => setmessage(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors duration-300 resize-none"
                    placeholder="Tell us what's on your mind..."
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white px-6 py-4 rounded-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <FaPaperPlane className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Info Section */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>We typically respond within 24 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;