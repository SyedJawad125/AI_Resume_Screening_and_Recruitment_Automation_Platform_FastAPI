'use client';
import React from 'react';
import Image from 'next/image';
import { ShoppingCart, Code, Smartphone, Brain, ArrowRight, Sparkles } from 'lucide-react';
import img1 from '../../public/images/1.jpg';
import img2 from '../../public/images/2.jpg';
import img3 from '../../public/images/3.jpg';

const Services = () => {
  const services = [
    {
      id: 1,
      title: 'E-Commerce',
      description: 'E-commerce, or electronic commerce, refers to the buying and selling of goods and services over the internet. It encompasses a wide range of online business activities, including online retail where businesses sell products directly to consumers through online platforms.',
      icon: ShoppingCart,
      image: img1,
      color: 'blue'
    },
    {
      id: 2,
      title: 'Web Developing',
      description: 'Categories in e-commerce play a crucial role in organizing products and enhancing the shopping experience for customers. They help in simplified navigation, allowing customers to easily navigate through an online store and quickly find the products they are looking for.',
      icon: Code,
      image: img2,
      color: 'purple'
    },
    {
      id: 3,
      title: 'Mobile App Developing',
      description: 'Products are the cornerstone of any online retail business. They represent the goods or services that are being offered to customers through a digital platform. This includes physical products like tangible items that require shipping, such as clothing, electronics, and household goods.',
      icon: Smartphone,
      image: img3,
      color: 'emerald'
    },
    {
      id: 4,
      title: 'Machine Learning',
      description: 'Discovering the latest additions to your favorite online store is always an exciting experience. Explore New Arrivals is all about diving into the freshest trends, the newest products, and the most innovative items that have just hit the shelves.',
      icon: Brain,
      image: img3,
      color: 'amber'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        border: 'border-blue-500/60',
        shadow: 'shadow-[0_20px_60px_-15px_rgba(59,130,246,0.3)]',
        iconBg: 'from-blue-600/20 to-blue-500/10',
        iconBorder: 'border-blue-500/30',
        iconColor: 'text-blue-400',
        hoverText: 'group-hover:text-blue-400'
      },
      purple: {
        border: 'border-purple-500/60',
        shadow: 'shadow-[0_20px_60px_-15px_rgba(168,85,247,0.3)]',
        iconBg: 'from-purple-600/20 to-purple-500/10',
        iconBorder: 'border-purple-500/30',
        iconColor: 'text-purple-400',
        hoverText: 'group-hover:text-purple-400'
      },
      emerald: {
        border: 'border-emerald-500/60',
        shadow: 'shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)]',
        iconBg: 'from-emerald-600/20 to-emerald-500/10',
        iconBorder: 'border-emerald-500/30',
        iconColor: 'text-emerald-400',
        hoverText: 'group-hover:text-emerald-400'
      },
      amber: {
        border: 'border-amber-500/60',
        shadow: 'shadow-[0_20px_60px_-15px_rgba(251,191,36,0.3)]',
        iconBg: 'from-amber-600/20 to-amber-500/10',
        iconBorder: 'border-amber-500/30',
        iconColor: 'text-amber-400',
        hoverText: 'group-hover:text-amber-400'
      }
    };
    return colors[color];
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 overflow-auto">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-full">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">What We Offer</span>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Our Services
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-slate-300 text-lg mb-2 max-w-3xl mx-auto">
            Some text about who we are and what we do.
          </p>
          <p className="text-slate-400 text-sm">
            Resize the browser window to see that this page is responsive by the way.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            const colorClasses = getColorClasses(service.color);
            
            return (
              <div
                key={service.id}
                className={`group relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-2 border-slate-700/30 rounded-3xl overflow-hidden hover:${colorClasses.border} transition-all duration-700 hover:${colorClasses.shadow} hover:-translate-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.5)]`}
              >
                {/* Luxury border frame */}
                <div className="absolute inset-0 rounded-3xl pointer-events-none">
                  <div className={`absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 ${colorClasses.iconBorder} rounded-tl-3xl opacity-40 group-hover:opacity-100 transition-opacity`}></div>
                  <div className={`absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 ${colorClasses.iconBorder} rounded-tr-3xl opacity-40 group-hover:opacity-100 transition-opacity`}></div>
                  <div className={`absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 ${colorClasses.iconBorder} rounded-bl-3xl opacity-40 group-hover:opacity-100 transition-opacity`}></div>
                  <div className={`absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 ${colorClasses.iconBorder} rounded-br-3xl opacity-40 group-hover:opacity-100 transition-opacity`}></div>
                </div>

                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                  <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500`}></div>
                </div>

                {/* Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden m-2 rounded-2xl">
                  <Image
                    src={service.image}
                    alt={service.title}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                  
                  {/* Vignette effect */}
                  <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)]"></div>

                  {/* Icon Badge */}
                  <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
                    <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses.iconBg} rounded-xl flex items-center justify-center border-2 ${colorClasses.iconBorder} shadow-lg backdrop-blur-sm`}>
                      <Icon className={`w-6 h-6 ${colorClasses.iconColor}`} />
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 relative z-10">
                  {/* Title */}
                  <h3 className={`text-2xl font-bold text-white mb-3 ${colorClasses.hoverText} transition-colors duration-300`}>
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-4">
                    {service.description}
                  </p>

                  {/* Learn More Button */}
                  <button className={`flex items-center gap-2 text-sm font-semibold ${colorClasses.iconColor} group-hover:gap-3 transition-all duration-300`}>
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-8"></div>
    </div>
  );
};

export default Services;