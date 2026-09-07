'use client';
import React, { useState, useRef, useEffect, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';

const NavbarCom = ({ isSticky = false }) => {
  const pathname = usePathname();
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Check if context exists
  if (!authContext) {
    console.error('AuthContext is not available in NavbarCom');
    return null;
  }

  const { user, isAuthenticated, logout, loading } = authContext;

  const navItems = [
    { name: 'Home', path: '/' },
    // { name: 'Blogs', path: '/blogs' },
    { name: 'Kids', path: '/kidspage' },
    { name: 'Shop', path: '/publicproducts' },
    { name: 'Sale', path: '/publicsalesproduct' },
    { name: 'New In', path: '/newarrivals' },
    { name: 'Collections', path: '/publiccategories' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    console.log('Logout button clicked from navbar');
    try {
      await logout();
      setIsDropdownOpen(false);
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    } else if (user.full_name) {
      const names = user.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
      }
      return user.full_name.charAt(0).toUpperCase();
    } else if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get display name
  const getDisplayName = () => {
    if (!user) return 'User';
    
    if (user.full_name) {
      return user.full_name;
    } else if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.username) {
      return user.username;
    }
    return 'User';
  };

  return (
    <nav className={`w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 backdrop-blur-md shadow-[0_3px_10px_rgba(0,0,0,0.4)] transition-all duration-300 ${
      isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-2xl' : 'relative'
    }`}>
      <div className="container mx-auto flex justify-between items-center py-2 px-8">
        {/* Brand Name */}
        <div
          className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600 font-serif text-2xl tracking-[0.15em] uppercase hover:scale-105 transition-transform duration-300"
          style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
        >
          <Link href="/">AI Blogs</Link>
        </div>

        {/* Nav Links - Centered */}
        <ul className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-10">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path} className="relative group">
                <Link href={item.path}>
                  <span
                    className={`transition-all duration-300 font-serif text-base tracking-wider ${
                      isActive
                        ? 'text-amber-400 font-semibold'
                        : 'text-gray-200 hover:text-amber-300'
                    }`}
                    style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', serif" }}
                  >
                    {item.name}
                  </span>
                </Link>
                {/* Animated underline */}
                <span
                  className={`absolute left-0 -bottom-1 h-[2px] rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-full bg-amber-400'
                      : 'w-0 bg-amber-300 group-hover:w-full'
                  }`}
                ></span>
              </li>
            );
          })}
        </ul>

        {/* User Authentication Section - Right Side */}
        <div className="flex items-center justify-end w-52 h-8">
          {loading ? (
            // Loading state
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
            </div>
          ) : isAuthenticated && user ? (
            // Logged in user - Show user dropdown
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 group hover:bg-gray-800/50 rounded-full px-3 py-2 transition-all duration-300"
              >
                {/* User Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white font-semibold shadow-lg group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={getDisplayName()}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm">
                      {getUserInitials()}
                    </span>
                  )}
                </div>
                
                {/* User Name & Role */}
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-gray-200 font-serif text-sm tracking-wide group-hover:text-amber-300 transition-colors duration-300">
                    {getDisplayName()}
                  </span>
                  {user.role_name && (
                    <span className="text-xs text-gray-400">
                      {user.role_name}
                    </span>
                  )}
                </div>

                {/* Dropdown Arrow */}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-amber-500/30 rounded-lg shadow-2xl overflow-hidden animate-fadeIn z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-sm font-semibold text-amber-400 truncate">
                      {getDisplayName()}
                    </p>
                    {user.email && (
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {user.email}
                      </p>
                    )}
                    {user.role_name && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded-full">
                          {user.role_name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-amber-400 transition-colors duration-200"
                    >
                      <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>My Profile</span>
                      </span>
                    </Link>
                    
                    <Link
                      href="/admindashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-amber-400 transition-colors duration-200"
                    >
                      <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span>Dashboard</span>
                      </span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-amber-400 transition-colors duration-200"
                    >
                      <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                      </span>
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div className="border-t border-gray-800">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors duration-200"
                    >
                      <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
          {/* When not logged in, show nothing (Login button is in TopNavbar) */}
        </div>
      </div>

      {/* Elegant Glow Line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"></div>

      {/* Add fadeIn animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default NavbarCom;





