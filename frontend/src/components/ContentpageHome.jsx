'use client';
import React from 'react';

export default function DesignPage() {
  return (
    <div className="relative flex flex-col items-center justify-center bg-gradient-to-b from-[#fdfaf6] via-[#f9f6f1] to-[#f7f3ec] py-20 px-6 md:px-20 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#e8c547]/5 rounded-full blur-3xl"></div>

      <div className="relative flex flex-col md:flex-row items-center md:items-stretch max-w-7xl mx-auto rounded-2xl border border-[#e6d5b8]/50 bg-white/90 backdrop-blur-xl shadow-[0_10px_60px_rgba(212,175,55,0.12)] overflow-hidden group hover:shadow-[0_15px_80px_rgba(212,175,55,0.25)] transition-all duration-700 ease-in-out">

        {/* Image Section */}
        <div className="relative w-full md:w-1/2 overflow-hidden">
          {/* Golden accent corner */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#d4af37]/40 z-10"></div>
          
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
            alt="E-commerce blog illustration"
            className="w-full h-full min-h-[400px] md:min-h-[600px] object-cover transform group-hover:scale-110 transition-transform duration-[3000ms] ease-out brightness-[0.95] group-hover:brightness-100"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-[#d4af37]/10"></div>
          
          {/* Bottom golden accent */}
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#d4af37]/40"></div>
        </div>

        {/* Text Section */}
        <div className="relative w-full md:w-1/2 p-10 md:p-14 lg:p-16 text-gray-800 flex flex-col justify-center">
          {/* Top decorative line */}
          <div className="flex items-center gap-3 mb-6 animate-fadeIn">
            <div className="w-12 h-px bg-gradient-to-r from-[#d4af37] to-transparent"></div>
            <span className="text-[#d4af37] text-xs font-semibold tracking-[0.3em] uppercase">
              Featured Article
            </span>
          </div>

          {/* Title with accent border */}
          <div className="relative mb-8 animate-slideUp">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#d4af37] via-[#e8c547] to-[#d4af37] rounded-full"></div>
            <h2 className="pl-6 text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2a1f0f] leading-tight">
              The Evolution of E-Commerce
            </h2>
          </div>

          {/* Description */}
          <div className="space-y-5 mb-10 animate-fadeInDelay">
            <p className="text-lg md:text-xl leading-relaxed text-gray-700 font-light">
              E-commerce represents the modern transformation of retail — where technology meets convenience. 
              Businesses can now reach a global audience 24/7, offering diverse products and personalized experiences 
              beyond the limits of traditional storefronts.
            </p>

            <p className="text-lg md:text-xl leading-relaxed text-gray-700 font-light">
              From secure digital payments to data-driven marketing, online commerce has redefined how consumers shop 
              and how brands build trust. It&apos;s not just about transactions — it&apos;s about creating meaningful digital journeys.
            </p>
          </div>

          {/* CTA Button */}
          <div className="animate-fadeInDelay2">
            <button className="group/btn relative px-8 py-3.5 bg-gradient-to-r from-[#d4af37] via-[#e8c547] to-[#d4af37] text-black font-semibold rounded-full overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-105">
              <span className="relative z-10 flex items-center gap-2">
                Read Full Story
                <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity duration-500"></div>
            </button>
          </div>

          {/* Bottom decorative element */}
          <div className="absolute bottom-8 right-8 flex items-center gap-2 opacity-30">
            <div className="w-2 h-2 rounded-full bg-[#d4af37]"></div>
            <div className="w-2 h-2 rounded-full bg-[#e8c547]"></div>
            <div className="w-2 h-2 rounded-full bg-[#d4af37]"></div>
          </div>
        </div>
      </div>

      {/* Elegant Footer Glow */}
      <div className="mt-16 relative">
        <div className="w-96 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-br from-[#d4af37] to-[#e8c547] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.8)]"></div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes pulseSlow {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 1s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 1.2s ease-in forwards;
        }
        .animate-fadeInDelay {
          animation: fadeIn 1.5s ease-in 0.3s forwards;
          opacity: 0;
        }
        .animate-fadeInDelay2 {
          animation: fadeIn 1.5s ease-in 0.6s forwards;
          opacity: 0;
        }
        .animate-pulse-slow {
          animation: pulseSlow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}