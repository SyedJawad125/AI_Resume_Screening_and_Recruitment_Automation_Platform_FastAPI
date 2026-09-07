// 'use client';
// import Link from 'next/link';
// import React, { useState, useEffect } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPhone, faSignInAlt, faUserPlus, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
// import { useRouter } from 'next/navigation';

// const TopNavbarCom = ({ visible }) => {
//   const router = useRouter();
//   const [isLoggingOut, setIsLoggingOut] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const token = localStorage.getItem('token');
//       setIsAuthenticated(!!token);
//     }
//   }, []);

//   const logout = () => {
//     setIsLoggingOut(true);
//     localStorage.removeItem('token');
//     setIsAuthenticated(false);
//     router.push('/');
//   };

//   return (
//     <div className={`bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white shadow-md transition-all duration-300 ${
//       visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
//     }`}>
//       <div className="container mx-auto flex justify-between items-center py-1.5 px-5 text-xs">
//         {/* Left Section */}
//         <div className="flex items-center space-x-2">
//           <div className="flex items-center bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-medium px-2.5 py-0.5 rounded-full">
//             <FontAwesomeIcon icon={faPhone} className="h-2.5 w-2.5 mr-1" />
//             <span>(+92) 333 1906382</span>
//           </div>
//         </div>

//         {/* Right Section */}
//         <div className="flex items-center space-x-3 font-medium">
//           {isAuthenticated ? (
//             <button
//               onClick={logout}
//               disabled={isLoggingOut}
//               className={`flex items-center gap-1.5 transition-all duration-300 px-3 py-0.5 rounded-full 
//                 bg-gradient-to-r from-red-500 to-red-700 text-white hover:shadow-[0_0_8px_rgba(255,0,0,0.5)] 
//                 hover:scale-105 active:scale-95
//                 ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <FontAwesomeIcon icon={faSignOutAlt} className="h-3 w-3" />
//               <span>{isLoggingOut ? '...' : 'Logout'}</span>
//             </button>
//           ) : (
//             <Link href="/Login">
//               <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-600 
//                 hover:shadow-[0_0_8px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
//                 <FontAwesomeIcon icon={faSignInAlt} className="h-3 w-3" />
//                 <span>Login</span>
//               </div>
//             </Link>
//           )}

//           <Link href="/signup">
//             <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-700 
//               hover:shadow-[0_0_8px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
//               <FontAwesomeIcon icon={faUserPlus} className="h-3 w-3" />
//               <span>Sign Up</span>
//             </div>
//           </Link>
//         </div>
//       </div>

//       {/* Elegant Thin Glow Border */}
//       <div className="h-[1px] w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"></div>
//     </div>
//   );
// };

// export default TopNavbarCom;



'use client';
import Link from 'next/link';
import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faSignInAlt, faUserPlus, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';

const TopNavbarCom = ({ visible }) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isAuthenticated, logout: authLogout } = useContext(AuthContext);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authLogout();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={`bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white shadow-md transition-all duration-300 ${
      visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className="container mx-auto flex justify-between items-center py-1.5 px-5 text-xs">
        {/* Left Section */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-medium px-2.5 py-0.5 rounded-full">
            <FontAwesomeIcon icon={faPhone} className="h-2.5 w-2.5 mr-1" />
            <span>(+92) 333 1906382</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3 font-medium">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`flex items-center gap-1.5 transition-all duration-300 px-3 py-0.5 rounded-full 
                bg-gradient-to-r from-red-500 to-red-700 text-white hover:shadow-[0_0_8px_rgba(255,0,0,0.5)] 
                hover:scale-105 active:scale-95
                ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="h-3 w-3" />
              <span>{isLoggingOut ? '...' : 'Logout'}</span>
            </button>
          ) : (
            <>
              <Link href="/login">
                <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-600 
                  hover:shadow-[0_0_8px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
                  <FontAwesomeIcon icon={faSignInAlt} className="h-3 w-3" />
                  <span>Login</span>
                </div>
              </Link>

              <Link href="/signup">
                <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-700 
                  hover:shadow-[0_0_8px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
                  <FontAwesomeIcon icon={faUserPlus} className="h-3 w-3" />
                  <span>Sign Up</span>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Elegant Thin Glow Border */}
      <div className="h-[1px] w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"></div>
    </div>
  );
};

export default TopNavbarCom;