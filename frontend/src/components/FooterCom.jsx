// 'use client';
// import React from 'react';
// import Image from 'next/image';
// import logo from '../../public/images/logo5.jpg';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
// import { FaFacebookF, FaTwitter, FaInstagram, FaWhatsapp, FaLinkedinIn, FaYoutube } from 'react-icons/fa';

// const Footer = () => {
//   return (
//     <footer className="relative bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-200 pt-12 pb-6 border-t-4 border-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-[0_0_25px_rgba(255,200,0,0.3)]">
//       {/* Top section */}
//       <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 px-6 md:px-16">
        
//         {/* Logo */}
//         <div className="flex flex-col items-center md:items-start">
//           <a href="/">
//             <Image
//               src={logo}
//               alt="Logo"
//               width={160}
//               height={90}
//               className="rounded-lg shadow-lg border border-amber-500/30 hover:shadow-[0_0_20px_rgba(255,200,0,0.4)] transition-all duration-500"
//             />
//           </a>
//           <p className="text-gray-400 text-sm mt-4 text-center md:text-left leading-relaxed">
//             Empowering businesses and individuals with elegant digital solutions that inspire innovation and success.
//           </p>
//         </div>

//         {/* Support */}
//         <div>
//           <h2 className="text-xl font-semibold mb-4 text-amber-400">Support</h2>
//           <ul className="space-y-2 text-sm">
//             <li><a href="/faq" className="hover:text-amber-300 transition-colors duration-300">FAQ</a></li>
//             <li><a href="/contact" className="hover:text-amber-300 transition-colors duration-300">Contact Us</a></li>
//             <li><a href="/returns" className="hover:text-amber-300 transition-colors duration-300">Returns</a></li>
//           </ul>
//         </div>

//         {/* Useful Links */}
//         <div>
//           <h2 className="text-xl font-semibold mb-4 text-amber-400">Useful Links</h2>
//           <ul className="space-y-2 text-sm">
//             <li><a href="/" className="hover:text-amber-300 transition-colors duration-300">Home</a></li>
//             <li><a href="/about" className="hover:text-amber-300 transition-colors duration-300">About Us</a></li>
//             <li><a href="/contact" className="hover:text-amber-300 transition-colors duration-300">Contact</a></li>
//           </ul>
//         </div>

//         {/* Our Services */}
//         <div>
//           <h2 className="text-xl font-semibold mb-4 text-amber-400">Our Services</h2>
//           <ul className="space-y-2 text-sm">
//             <li><a href="/publicproduct" className="hover:text-amber-300 transition-colors duration-300">Products</a></li>
//             <li><a href="/publiccategory" className="hover:text-amber-300 transition-colors duration-300">Categories</a></li>
//             <li><a href="/blog" className="hover:text-amber-300 transition-colors duration-300">Blog</a></li>
//           </ul>
//         </div>

//         {/* Contact */}
//         <div>
//           <h2 className="text-xl font-semibold mb-4 text-amber-400">Contact Us</h2>
//           <ul className="text-sm space-y-2">
//             <li className="flex items-start">
//               <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 text-amber-400" />
//               DHA Phase 2, Islamabad, Pakistan
//             </li>
//             <li className="flex items-center">
//               <FontAwesomeIcon icon={faPhone} className="mr-3 text-amber-400" /> (+92) 333 1906382
//             </li>
//             <li className="flex items-center">
//               <FontAwesomeIcon icon={faEnvelope} className="mr-3 text-amber-400" /> nicenick1992@gmail.com
//             </li>
//           </ul>

//           {/* Social Icons */}
//           <div className="flex space-x-4 mt-5">
//             {[
//               { icon: <FaFacebookF />, href: 'https://www.facebook.com' },
//               { icon: <FaTwitter />, href: 'https://www.twitter.com' },
//               { icon: <FaInstagram />, href: 'https://www.instagram.com' },
//               { icon: <FaWhatsapp />, href: 'https://wa.me/923331906382' },
//               { icon: <FaLinkedinIn />, href: 'https://www.linkedin.com/in/syed-jawad-ali-080286b9/' },
//               { icon: <FaYoutube />, href: 'https://www.youtube.com' },
//             ].map((social, i) => (
//               <a
//                 key={i}
//                 href={social.href}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-gray-300 text-xl p-2 rounded-full border border-amber-500/40 hover:bg-amber-400 hover:text-black transition-all duration-500 hover:shadow-[0_0_15px_rgba(255,200,0,0.8)]"
//               >
//                 {social.icon}
//               </a>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Divider Line */}
//       <div className="mt-10 border-t border-gray-700/60 w-11/12 mx-auto"></div>

//       {/* Bottom Text */}
//       <div className="text-center mt-6 text-gray-400 text-sm">
//         <p>
//           © {new Date().getFullYear()} <span className="text-amber-400 font-semibold">Your Company</span>. All rights reserved.
//         </p>
//         <p className="mt-1 text-xs italic text-gray-500">
//           Designed with passion by <span className="text-amber-400">Syed Jawad Ali</span>
//         </p>
//       </div>
//     </footer>
//   );
// };

// export default Footer;



'use client';
import React from 'react';
import Image from 'next/image';
import logo from '../../public/images/logo5.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FaFacebookF, FaTwitter, FaInstagram, FaWhatsapp, FaLinkedinIn, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-black to-gray-950 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      {/* Top section */}
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 px-6 md:px-16">
        
        {/* Logo & Description */}
        <div className="flex flex-col items-center md:items-start lg:col-span-2">
          <a href="/" className="mb-4">
            <Image
              src={logo}
              alt="Logo"
              width={160}
              height={90}
              className="rounded-lg shadow-lg border border-gray-700 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/50 transition-all duration-500"
            />
          </a>
          <p className="text-gray-400 text-sm leading-relaxed text-center md:text-left max-w-sm">
            Exploring ideas, sharing stories, and inspiring minds. Join our community of passionate writers and curious readers as we journey through the world of knowledge and creativity.
          </p>
          
          {/* Newsletter */}
          <div className="mt-6 w-full max-w-sm">
            <h4 className="text-sm font-semibold text-gray-200 mb-2">Subscribe to our newsletter</h4>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-2 text-sm border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-gray-200 placeholder-gray-500"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-white relative inline-block">
            Quick Links
            <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></span>
          </h2>
          <ul className="space-y-3 text-sm">
            <li><a href="/" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-blue-500 transition-colors"></span>
              Home
            </a></li>
            <li><a href="/about" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-blue-500 transition-colors"></span>
              About Us
            </a></li>
            <li><a href="/blog" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-blue-500 transition-colors"></span>
              Blog
            </a></li>
            <li><a href="/contact" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-blue-500 transition-colors"></span>
              Contact
            </a></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-white relative inline-block">
            Categories
            <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></span>
          </h2>
          <ul className="space-y-3 text-sm">
            <li><a href="/publicproduct" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-blue-500 transition-colors"></span>
              Products
            </a></li>
            <li><a href="/publiccategory" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-blue-500 transition-colors"></span>
              Categories
            </a></li>
            <li><a href="/blog" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-blue-500 transition-colors"></span>
              Blog
            </a></li>
            <li><a href="/faq" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center group">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-2 group-hover:bg-blue-500 transition-colors"></span>
              FAQ
            </a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-white relative inline-block">
            Get in Touch
            <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></span>
          </h2>
          <ul className="text-sm space-y-3">
            <li className="flex items-start group">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-3 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-400 group-hover:text-blue-400 transition-colors">
                DHA Phase 2, Islamabad, Pakistan
              </span>
            </li>
            <li className="flex items-center group">
              <FontAwesomeIcon icon={faPhone} className="mr-3 text-blue-500 flex-shrink-0" />
              <a href="tel:+923331906382" className="text-gray-400 group-hover:text-blue-400 transition-colors">
                (+92) 333 1906382
              </a>
            </li>
            <li className="flex items-center group">
              <FontAwesomeIcon icon={faEnvelope} className="mr-3 text-blue-500 flex-shrink-0" />
              <a href="mailto:nicenick1992@gmail.com" className="text-gray-400 group-hover:text-blue-400 transition-colors break-all">
                nicenick1992@gmail.com
              </a>
            </li>
          </ul>

          {/* Social Icons */}
          <div className="flex gap-3 mt-6">
            {[
              { icon: <FaFacebookF />, href: 'https://www.facebook.com' },
              { icon: <FaTwitter />, href: 'https://www.twitter.com' },
              { icon: <FaInstagram />, href: 'https://www.instagram.com' },
              { icon: <FaWhatsapp />, href: 'https://wa.me/923331906382' },
              { icon: <FaLinkedinIn />, href: 'https://www.linkedin.com/in/syed-jawad-ali-080286b9/' },
              { icon: <FaYoutube />, href: 'https://www.youtube.com' },
            ].map((social, i) => (
              <a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 hover:-translate-y-1"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-12 border-t border-gray-800 w-11/12 mx-auto"></div>

      {/* Bottom section */}
      <div className="container mx-auto px-6 md:px-16 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p className="mb-4 md:mb-0">
            © {new Date().getFullYear()} <span className="text-blue-400 font-semibold">Your Company</span>. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs">
            <a href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</a>
            <a href="/returns" className="hover:text-blue-400 transition-colors">Returns</a>
          </div>
        </div>
        <p className="text-center mt-4 text-xs text-gray-500">
          Crafted with <span className="text-red-500">♥</span> by <span className="text-blue-400 font-medium">Syed Jawad Ali</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;