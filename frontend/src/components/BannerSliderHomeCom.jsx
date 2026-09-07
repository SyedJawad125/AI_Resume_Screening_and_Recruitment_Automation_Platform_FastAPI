// 'use client';
// import React from 'react';
// import { Carousel } from 'react-responsive-carousel';
// import 'react-responsive-carousel/lib/styles/carousel.min.css';

// const banners = [
//   {
//     src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
//     title: 'The Art of Modern Leadership',
//     subtitle: 'Explore insights, ideas, and innovations shaping the workplace of tomorrow.',
//   },
//   {
//     src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
//     title: 'Redefining Team Culture',
//     subtitle: 'Inspiring stories of collaboration, growth, and purpose.',
//   },
//   {
//     src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
//     title: 'Behind Every Success Story',
//     subtitle: 'Discover people, passion, and purpose driving progress.',
//   },
//   {
//     src: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80',
//     title: 'Trends That Matter',
//     subtitle: 'Uncover strategies that empower today\'s creators and innovators.',
//   },
//   {
//     src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80',
//     title: 'Voices of Change',
//     subtitle: 'Thoughts and reflections from industry leaders around the globe.',
//   },
// ];

// const BlogLuxuryBanner = () => {
//   return (
//     <div className="relative w-full overflow-hidden">
//       {/* Golden border top */}
//       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent z-10"></div>
      
//       <Carousel
//         showThumbs={false}
//         showStatus={false}
//         autoPlay
//         infiniteLoop
//         interval={6000}
//         transitionTime={1000}
//         stopOnHover
//         swipeable
//         emulateTouch
//         showIndicators={true}
//         renderIndicator={(onClickHandler, isSelected, index) => (
//           <button
//             onClick={onClickHandler}
//             className={`inline-block mx-1.5 transition-all duration-500 ${
//               isSelected
//                 ? 'w-8 h-1.5 bg-gradient-to-r from-[#d4af37] to-[#e8c547] shadow-[0_0_12px_rgba(212,175,55,0.8)]'
//                 : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60 rounded-full'
//             }`}
//             aria-label={`Slide ${index + 1}`}
//           />
//         )}
//         renderArrowPrev={(onClickHandler, hasPrev) =>
//           hasPrev && (
//             <button
//               onClick={onClickHandler}
//               className="absolute left-6 top-1/2 z-20 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-xl border border-white/20 text-white text-2xl hover:bg-black/40 hover:border-[#d4af37]/50 hover:scale-110 transition-all duration-300 shadow-lg"
//               aria-label="Previous slide"
//             >
//               ‹
//             </button>
//           )
//         }
//         renderArrowNext={(onClickHandler, hasNext) =>
//           hasNext && (
//             <button
//               onClick={onClickHandler}
//               className="absolute right-6 top-1/2 z-20 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-xl border border-white/20 text-white text-2xl hover:bg-black/40 hover:border-[#d4af37]/50 hover:scale-110 transition-all duration-300 shadow-lg"
//               aria-label="Next slide"
//             >
//               ›
//             </button>
//           )
//         }
//       >
//         {banners.map((banner, index) => (
//           <div key={index} className="relative group">
//             {/* Image with parallax effect */}
//             {/* <div className="w-full h-[28vh] md:h-[40vh] lg:h-[50vh] overflow-hidden">
//               <img
//                 src={banner.src}
//                 alt={banner.title}
//                 className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[3000ms] ease-out brightness-[0.7]"
//               />
//             </div> */}
//             <div className="w-full h-[calc(99vh-6rem)] overflow-hidden">
//               <img
//                 src={banner.src}
//                 alt={banner.title}
//                 className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[3000ms] ease-out brightness-[0.7]"
//               />
//             </div> */

//             {/* Multi-layer gradient overlay */}
//             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>
//             <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30"></div>

//             {/* Animated golden accent */}
//             <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent animate-pulse-slow"></div>

//             {/* Content container */}
//             <div className="absolute inset-0 flex flex-col justify-center items-start px-8 md:px-16 lg:px-24">
//               <div className="max-w-3xl space-y-6">
//                 {/* Small overline */}
//                 <div className="flex items-center gap-3 animate-fadeIn">
//                   <div className="w-12 h-px bg-gradient-to-r from-[#d4af37] to-transparent"></div>
//                   <span className="text-[#e8c547] text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">
//                     Featured
//                   </span>
//                 </div>

//                 {/* Main title */}
//                 <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight animate-slideUp">
//                   {banner.title}
//                 </h2>

//                 {/* Subtitle */}
//                 <p className="text-base md:text-xl lg:text-2xl text-gray-200 font-light leading-relaxed max-w-2xl animate-fadeInDelay">
//                   {banner.subtitle}
//                 </p>

//                 {/* CTA Button */}
//                 <div className="pt-4 animate-fadeInDelay2">
//                   <button className="group/btn relative px-8 py-3 bg-gradient-to-r from-[#d4af37] via-[#e8c547] to-[#d4af37] text-black font-semibold rounded-full overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-105">
//                     <span className="relative z-10 flex items-center gap-2">
//                       Explore Articles
//                       <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//                       </svg>
//                     </span>
//                     <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity duration-500"></div>
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Decorative corner accents */}
//             <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-[#d4af37]/30 animate-fadeIn"></div>
//             <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-[#d4af37]/30 animate-fadeIn"></div>
//           </div>
//         ))}
//       </Carousel>

//       {/* Bottom golden border */}
//       <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent z-10"></div>

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
//         @keyframes pulseSlow {
//           0%, 100% {
//             opacity: 0.3;
//           }
//           50% {
//             opacity: 1;
//           }
//         }
//         .animate-slideUp {
//           animation: slideUp 1s ease-out forwards;
//         }
//         .animate-fadeIn {
//           animation: fadeIn 1.5s ease-in forwards;
//         }
//         .animate-fadeInDelay {
//           animation: fadeIn 1.5s ease-in 0.4s forwards;
//           opacity: 0;
//         }
//         .animate-fadeInDelay2 {
//           animation: fadeIn 1.5s ease-in 0.7s forwards;
//           opacity: 0;
//         }
//         .animate-pulse-slow {
//           animation: pulseSlow 3s ease-in-out infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default BlogLuxuryBanner;




'use client';
import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import AxiosInstance from "@/components/AxiosInstance";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BlogLuxuryBanner = () => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBannerImages();
  }, []);

  const fetchBannerImages = async () => {
    setIsLoading(true);
    try {
      const res = await AxiosInstance.get('/api/images/v1/public/images/');
      
      // Handle the response structure from your API
      if (res?.data?.data && Array.isArray(res.data.data)) {
        // Filter only Bannerslider category images
        const bannerImages = res.data.data.filter(
          item => item.category_name === 'Bannerslider'
        );
        setBanners(bannerImages);
      } else if (res?.data && Array.isArray(res.data)) {
        const bannerImages = res.data.filter(
          item => item.category_name === 'Bannerslider'
        );
        setBanners(bannerImages);
      } else {
        console.error('Unexpected response structure:', res);
        toast.error('Received unexpected data format from server');
        setBanners([]);
      }
    } catch (error) {
      console.error('Error occurred:', error);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to view images');
      } else {
        toast.error(error.response?.data?.message || 'Error fetching banner images');
      }
      setBanners([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative w-full h-[calc(102vh-6rem)] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/*  <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"> */}
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          theme="dark"
          className="mt-16"
        />
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-yellow-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="text-amber-400 font-semibold text-lg tracking-wide">Loading Banners...</p>
        </div>
      </div>
    );
  }

  // No banners state
  if (banners.length === 0) {
    return (
      <div className="relative w-full h-[calc(102vh-6rem)] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          theme="dark"
          className="mt-16"
        />
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Banner Images Found</h3>
          <p className="text-slate-400 mb-6">Please add some banner images in the Bannerslider category</p>
          <button 
            onClick={fetchBannerImages}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="dark"
        className="mt-16"
      />
      
      {/* Golden border top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent z-10"></div>
      
      <Carousel
        showThumbs={false}
        showStatus={false}
        autoPlay
        infiniteLoop
        interval={6000}
        transitionTime={1000}
        stopOnHover
        swipeable
        emulateTouch
        showIndicators={true}
        renderIndicator={(onClickHandler, isSelected, index) => (
          <button
            onClick={onClickHandler}
            className={`inline-block mx-1.5 transition-all duration-500 ${
              isSelected
                ? 'w-8 h-1.5 bg-gradient-to-r from-[#d4af37] to-[#e8c547] shadow-[0_0_12px_rgba(212,175,55,0.8)]'
                : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60 rounded-full'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        )}
        renderArrowPrev={(onClickHandler, hasPrev) =>
          hasPrev && (
            <button
              onClick={onClickHandler}
              className="absolute left-6 top-1/2 z-20 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-xl border border-white/20 text-white text-2xl hover:bg-black/40 hover:border-[#d4af37]/50 hover:scale-110 transition-all duration-300 shadow-lg"
              aria-label="Previous slide"
            >
              ‹
            </button>
          )
        }
        renderArrowNext={(onClickHandler, hasNext) =>
          hasNext && (
            <button
              onClick={onClickHandler}
              className="absolute right-6 top-1/2 z-20 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-xl border border-white/20 text-white text-2xl hover:bg-black/40 hover:border-[#d4af37]/50 hover:scale-110 transition-all duration-300 shadow-lg"
              aria-label="Next slide"
            >
              ›
            </button>
          )
        }
      >
        {banners.map((banner) => (
          <div key={banner.id} className="relative group">
            {/* Image with parallax effect */}
            <div className="w-full h-[calc(102vh-6rem)] overflow-hidden">
              <img
                src={banner.image}
                alt={banner.name}
                className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[3000ms] ease-out brightness-[0.7]"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80';
                }}
              />
            </div>

            {/* Multi-layer gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30"></div>

            {/* Animated golden accent */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent animate-pulse-slow"></div>

            {/* Content container */}
            <div className="absolute inset-0 flex flex-col justify-center items-start px-8 md:px-16 lg:px-24">
              <div className="max-w-3xl space-y-6">
                {/* Small overline */}
                <div className="flex items-center gap-3 animate-fadeIn">
                  <div className="w-12 h-px bg-gradient-to-r from-[#d4af37] to-transparent"></div>
                  <span className="text-[#e8c547] text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">
                    {banner.category_name || 'Featured'}
                  </span>
                </div>

                {/* Main title */}
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight animate-slideUp">
                  {banner.name}
                </h2>

                {/* Subtitle/Description */}
                {banner.description && (
                  <p className="text-base md:text-xl lg:text-2xl text-gray-200 font-light leading-relaxed max-w-2xl animate-fadeInDelay">
                    {banner.description}
                  </p>
                )}

                {/* Bullets Description (if available) */}
                {banner.bulletsdescription && banner.bulletsdescription !== banner.name && (
                  <p className="text-sm md:text-base text-amber-200/90 font-medium leading-relaxed max-w-2xl animate-fadeInDelay">
                    {banner.bulletsdescription}
                  </p>
                )}

                {/* CTA Button */}
                <div className="pt-4 animate-fadeInDelay2">
                  <button className="group/btn relative px-8 py-3 bg-gradient-to-r from-[#d4af37] via-[#e8c547] to-[#d4af37] text-black font-semibold rounded-full overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-105">
                    <span className="relative z-10 flex items-center gap-2">
                      Explore Articles
                      <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity duration-500"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Decorative corner accents */}
            <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-[#d4af37]/30 animate-fadeIn"></div>
            <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-[#d4af37]/30 animate-fadeIn"></div>
          </div>
        ))}
      </Carousel>

      {/* Bottom golden border */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent z-10"></div>

      <style jsx>{`
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
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
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 1s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 1.5s ease-in forwards;
        }
        .animate-fadeInDelay {
          animation: fadeIn 1.5s ease-in 0.4s forwards;
          opacity: 0;
        }
        .animate-fadeInDelay2 {
          animation: fadeIn 1.5s ease-in 0.7s forwards;
          opacity: 0;
        }
        .animate-pulse-slow {
          animation: pulseSlow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BlogLuxuryBanner;