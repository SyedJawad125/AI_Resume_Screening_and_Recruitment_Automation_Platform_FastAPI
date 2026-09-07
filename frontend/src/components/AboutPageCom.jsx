// import React from 'react'
// import Image from 'next/image';
// import img4 from '../../public/images/4.jpg'
// import img5 from '../../public/images/5.jpg'
// import img6 from '../../public/images/6.jpg'


// const AboutPage = () => {
//   return (
//     <div className="container mx-auto p-4 ml-56 w-3/4">
//   <div className="aboutservicesection text-center">
//     <h1 className="text-4xl font-bold mb-4">About Us</h1>
//     <p className="mb-2">Some text about who we are and what we do.</p>
//     <p className="mb-2">Resize the browser window to see that this page is responsive by the way.</p>
//   </div>

//   <div className="teamSection mt-10">
//     <h1 className="text-center text-3xl font-bold mb-8">Our Team</h1>
//     <div className="flex flex-wrap justify-center">
//       <div className="w-full md:w-1/4 p-2">
//         <div className="cardAbout bg-white shadow-lg rounded-lg overflow-hidden">
//           <Image src={img4} className="cardImgTopAbout w-full" width={500} height={500} alt="Service 1" />
//           <div className="cardBodyAbout p-4 text-center">
//             <h2 className="text-xl font-semibold">John Doe</h2>
//             <p className="text-gray-600">Designer</p>
//             <p className="text-gray-700 mt-2">Some text that describes me lorem ipsum ipsum lorem.</p>
//             <p className="text-gray-700">john@example.com</p>
//             <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Contact</button>
//           </div>
//         </div>
//       </div>

//       <div className="w-full md:w-1/4 p-2">
//         <div className="cardAbout bg-white shadow-lg rounded-lg overflow-hidden">
//           <Image src={img5} className="cardImgTopAbout w-full" width={500} height={500} alt="Service 2" />
//           <div className="cardBodyAbout p-4 text-center">
//             <h2 className="text-xl font-semibold">John Doe</h2>
//             <p className="text-gray-600">Designer</p>
//             <p className="text-gray-700 mt-2">Some text that describes me lorem ipsum ipsum lorem.</p>
//             <p className="text-gray-700">john@example.com</p>
//             <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Contact</button>
//           </div>
//         </div>
//       </div>

//       <div className="w-full md:w-1/4 p-2">
//         <div className="cardAbout bg-white shadow-lg rounded-lg overflow-hidden">
//           <Image src={img6} className="cardImgTopAbout w-full" width={500} height={500} alt="Service 3" />
//           <div className="cardBodyAbout p-4 text-center">
//             <h2 className="text-xl font-semibold">John Doe</h2>
//             <p className="text-gray-600">Designer</p>
//             <p className="text-gray-700 mt-2">Some text that describes me lorem ipsum ipsum lorem.</p>
//             <p className="text-gray-700">john@example.com</p>
//             <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Contact</button>
//           </div>
//         </div>
//       </div>

//       <div className="w-full md:w-1/4 p-2">
//         <div className="cardAbout bg-white shadow-lg rounded-lg overflow-hidden">
//           <Image src={img6} className="cardImgTopAbout w-full" width={500} height={500} alt="Service 4" />
//           <div className="cardBodyAbout p-4 text-center">
//             <h2 className="text-xl font-semibold">John Doe</h2>
//             <p className="text-gray-600">Designer</p>
//             <p className="text-gray-700 mt-2">Some text that describes me lorem ipsum ipsum lorem.</p>
//             <p className="text-gray-700">john@example.com</p>
//             <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Contact</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// </div>
//   );
// };

// export default AboutPage;

import React from 'react';
import Image from 'next/image';
import { Mail, User, Briefcase, Users, Target, Award, Zap } from 'lucide-react';
import img4 from '../../public/images/4.jpg';
import img5 from '../../public/images/5.jpg';
import img6 from '../../public/images/6.jpg';

const AboutPage = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Designer',
      description: 'Some text that describes me lorem ipsum ipsum lorem.',
      email: 'john@example.com',
      image: img4
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Developer',
      description: 'Some text that describes me lorem ipsum ipsum lorem.',
      email: 'jane@example.com',
      image: img5
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'Manager',
      description: 'Some text that describes me lorem ipsum ipsum lorem.',
      email: 'mike@example.com',
      image: img6
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      role: 'Marketing',
      description: 'Some text that describes me lorem ipsum ipsum lorem.',
      email: 'sarah@example.com',
      image: img6
    }
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 overflow-auto">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            About Us
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-slate-300 text-lg mb-2 max-w-3xl mx-auto">
            Some text about who we are and what we do.
          </p>
          <p className="text-slate-400 text-sm">
            Resize the browser window to see that this page is responsive by the way.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-3xl font-bold text-blue-400">50+</span>
            </div>
            <h3 className="text-white font-semibold mb-1">Team Members</h3>
            <p className="text-slate-400 text-sm">Dedicated professionals</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-purple-950/30 backdrop-blur-sm border border-purple-700/30 rounded-xl p-6 hover:border-purple-500/50 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-3xl font-bold text-purple-400">100+</span>
            </div>
            <h3 className="text-white font-semibold mb-1">Projects Done</h3>
            <p className="text-slate-400 text-sm">Successfully completed</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-6 hover:border-emerald-500/50 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-3xl font-bold text-emerald-400">25+</span>
            </div>
            <h3 className="text-white font-semibold mb-1">Awards Won</h3>
            <p className="text-slate-400 text-sm">Industry recognition</p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent mb-3">
            Our Team
          </h2>
          <p className="text-slate-400">Meet the talented people behind our success</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="group relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-2 border-slate-700/30 rounded-3xl overflow-hidden hover:border-amber-500/60 transition-all duration-700 hover:shadow-[0_20px_60px_-15px_rgba(251,191,36,0.3)] hover:-translate-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
            >
              {/* Luxury border frame */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-400/40 rounded-tl-3xl"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-400/40 rounded-tr-3xl"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-400/40 rounded-bl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-400/40 rounded-br-3xl"></div>
              </div>

              {/* Gold shimmer effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
              </div>

              {/* Image Section */}
              <div className="relative aspect-square overflow-hidden m-2 rounded-2xl">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                
                {/* Vignette effect */}
                <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)]"></div>

                {/* Role Badge */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="px-4 py-2 bg-gradient-to-r from-amber-600/90 via-amber-500/90 to-yellow-600/90 backdrop-blur-xl border-2 border-amber-400/30 rounded-full shadow-[0_4px_20px_rgba(251,191,36,0.4)]">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-white" />
                      <span className="text-white font-bold text-xs uppercase tracking-wider">{member.role}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 relative z-10">
                {/* Name */}
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors duration-300">
                  {member.name}
                </h3>

                {/* Description */}
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {member.description}
                </p>

                {/* Email */}
                <div className="flex items-center gap-2 mb-4 text-slate-300 text-sm">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>{member.email}</span>
                </div>

                {/* Contact Button */}
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:via-amber-400 hover:to-yellow-500 text-slate-900 font-bold rounded-xl shadow-[0_4px_20px_rgba(251,191,36,0.4)] hover:shadow-[0_6px_30px_rgba(251,191,36,0.6)] transition-all hover:scale-105 border-2 border-amber-400/30">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm uppercase tracking-wide">Contact</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-8"></div>
    </div>
  );
};

export default AboutPage;