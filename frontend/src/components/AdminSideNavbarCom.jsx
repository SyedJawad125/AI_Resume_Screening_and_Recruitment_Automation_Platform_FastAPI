// 'use client';
// import { useState, useEffect, useContext } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import { Home, Users, FileText, Settings, LogOut, Lock, Eye, Menu, X, ChevronRight, User, Shield, Zap, Globe, Image } from 'lucide-react';
// import { AuthContext } from '@/components/AuthContext'; // Adjust path as needed

// const AdminSideNavbarCom = () => {
//   const router = useRouter();
//   const pathname = usePathname();
  
//   // Use AuthContext instead of localStorage
//   const { isAuthenticated, user, role, logout, loading } = useContext(AuthContext);
  
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [activeRoute, setActiveRoute] = useState('/admindashboard');
//   const [hoveredItem, setHoveredItem] = useState(null);

//   // Update active route on pathname change
//   useEffect(() => {
//     console.log('Route changed to:', pathname);
//     setActiveRoute(pathname);
//   }, [pathname]);

//   // Log authentication state changes
//   useEffect(() => {
//     console.log('Auth state - isAuthenticated:', isAuthenticated, 'user:', user);
//   }, [isAuthenticated, user]);

//   const navigationItems = [
//     {
//       id: 'dashboard',
//       label: 'Dashboard',
//       icon: Home,
//       path: '/admindashboard',
//       roles: ['admin', 'editor'],
//       color: 'blue'
//     },
//     {
//       id: 'posts',
//       label: 'Blog Posts',
//       icon: FileText,
//       path: '/blogpostpage',
//       roles: ['admin', 'editor'],
//       color: 'purple'
//     },
//     {
//       id: 'images',
//       label: 'Images',
//       icon: Image,
//       path: '/imagespage',
//       roles: ['admin', 'editor'],
//       color: 'red'
//     },
//     {
//       id: 'employees',
//       label: 'Employee Records',
//       icon: Users,
//       path: '/employeepage',
//       roles: ['admin'],
//       color: 'emerald'
//     },
//     {
//       id: 'profile',
//       label: 'Client Profile',
//       icon: User,
//       path: '/clientselfpage',
//       roles: ['admin', 'editor', 'client'],
//       color: 'amber'
//     },
//     {
//       id: 'public',
//       label: 'Public Site',
//       icon: Globe,
//       path: '/',
//       roles: ['admin', 'editor', 'client'],
//       color: 'cyan'
//     }
//   ];

//   const handleNavigation = (path) => {
//     setActiveRoute(path);
//     router.push(path);
//   };

//   const handleLogout = async () => {
//     console.log('Logout button clicked');
//     await logout();
//     router.push('/Login');
//   };

//   const handleChangePassword = () => {
//     router.push('/changepassword');
//   };

//   // Get user initials for avatar
//   const getUserInitials = () => {
//     if (user?.name) {
//       const names = user.name.trim().split(' ');
//       if (names.length >= 2) {
//         return (names[0][0] + names[names.length - 1][0]).toUpperCase();
//       }
//       return user.name.substring(0, 2).toUpperCase();
//     }
//     return 'AU';
//   };

//   // Get user display name
//   const getUserDisplayName = () => {
//     return user?.name || user?.username || 'Admin User';
//   };

//   // Get user role display
//   const getUserRoleDisplay = () => {
//     return role?.name || user?.role_name || 'Admin';
//   };

//   // Get color classes based on item color
//   const getColorClasses = (color, isActive, isHovered) => {
//     const colors = {
//       blue: {
//         active: 'from-blue-600 to-blue-500 shadow-blue-500/30',
//         hover: 'hover:bg-blue-500/10',
//         icon: 'group-hover:text-blue-400'
//       },
//       purple: {
//         active: 'from-purple-600 to-purple-500 shadow-purple-500/30',
//         hover: 'hover:bg-purple-500/10',
//         icon: 'group-hover:text-purple-400'
//       },
//       red: {
//         active: 'from-red-600 to-red-500 shadow-red-500/30',
//         hover: 'hover:bg-red-500/10',
//         icon: 'group-hover:text-red-400'
//       },
//       emerald: {
//         active: 'from-emerald-600 to-emerald-500 shadow-emerald-500/30',
//         hover: 'hover:bg-emerald-500/10',
//         icon: 'group-hover:text-emerald-400'
//       },
//       amber: {
//         active: 'from-amber-600 to-amber-500 shadow-amber-500/30',
//         hover: 'hover:bg-amber-500/10',
//         icon: 'group-hover:text-amber-400'
//       },
//       cyan: {
//         active: 'from-cyan-600 to-cyan-500 shadow-cyan-500/30',
//         hover: 'hover:bg-cyan-500/10',
//         icon: 'group-hover:text-cyan-400'
//       }
//     };
    
//     return colors[color] || colors.blue;
//   };

//   // Show loading state if auth is loading
//   if (loading) {
//     return (
//       <div className="fixed top-0 left-0 h-screen w-72 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   console.log('Render - isAuthenticated:', isAuthenticated); // Debug log

//   return (
//     <div className="relative h-screen">
//       {/* Sidebar */}
//       <div 
//         className={`fixed top-0 left-0 h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white transition-all duration-300 ease-in-out ${
//           isCollapsed ? 'w-20' : 'w-72'
//         } shadow-2xl border-r border-slate-700/50 z-50 overflow-hidden`}
//       >
//         {/* Animated background effect */}
//         <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-50"></div>
//         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
//         <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

//         <div className="relative z-10 h-full flex flex-col">
//           {/* Header */}
//           <div className="relative p-6 border-b border-slate-700/50 backdrop-blur-sm">
//             <div className="flex items-center justify-between">
//               <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
//                 <div className="relative">
//                   <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
//                     <FileText className="w-6 h-6" />
//                   </div>
//                   <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
//                 </div>
//                 {!isCollapsed && (
//                   <div className="flex flex-col">
//                     <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
//                       BlogCMS
//                     </h2>
//                     <p className="text-xs text-slate-400 font-medium">Admin Panel v2.0</p>
//                   </div>
//                 )}
//               </div>
//               {!isCollapsed && (
//                 <button
//                   onClick={() => setIsCollapsed(true)}
//                   className="p-2 hover:bg-slate-700/50 rounded-lg transition-all hover:rotate-90 duration-300"
//                   title="Collapse sidebar"
//                 >
//                   <X className="w-5 h-5 text-slate-400" />
//                 </button>
//               )}
//             </div>
//             {isCollapsed && (
//               <button
//                 onClick={() => setIsCollapsed(false)}
//                 className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-full flex items-center justify-center shadow-lg transition-all border border-slate-600 hover:scale-110"
//                 title="Expand sidebar"
//               >
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//             )}
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
//             {!isCollapsed && (
//               <div className="px-2 mb-4">
//                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigation</p>
//               </div>
//             )}
            
//             {navigationItems.map((item) => {
//               const Icon = item.icon;
//               const isActive = activeRoute === item.path;
//               const isHovered = hoveredItem === item.id;
//               const colorClasses = getColorClasses(item.color, isActive, isHovered);
              
//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => handleNavigation(item.path)}
//                   onMouseEnter={() => setHoveredItem(item.id)}
//                   onMouseLeave={() => setHoveredItem(null)}
//                   className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
//                     isActive
//                       ? `bg-gradient-to-r ${colorClasses.active} shadow-lg`
//                       : `${colorClasses.hover} hover:shadow-md`
//                   } ${isCollapsed ? 'justify-center' : ''}`}
//                   title={isCollapsed ? item.label : ''}
//                 >
//                   {/* Active indicator */}
//                   {isActive && !isCollapsed && (
//                     <div className="absolute left-0 w-1.5 h-10 bg-white rounded-r-full shadow-lg"></div>
//                   )}
                  
//                   {/* Background shimmer effect */}
//                   {isActive && (
//                     <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 animate-shimmer"></div>
//                   )}
                  
//                   <Icon 
//                     className={`w-5 h-5 transition-all duration-200 relative z-10 ${
//                       isHovered && !isActive ? 'scale-110 rotate-3' : ''
//                     } ${isActive ? 'text-white' : `text-slate-400 ${colorClasses.icon}`}`}
//                   />
                  
//                   {!isCollapsed && (
//                     <>
//                       <span className={`flex-1 text-left font-medium relative z-10 transition-all ${
//                         isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
//                       }`}>
//                         {item.label}
//                       </span>
                      
//                       {isHovered && !isActive && (
//                         <ChevronRight className="w-4 h-4 text-slate-400 relative z-10 animate-pulse" />
//                       )}
//                     </>
//                   )}
                  
//                   {/* Collapsed active indicator */}
//                   {isCollapsed && isActive && (
//                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-t-full"></div>
//                   )}
//                 </button>
//               );
//             })}
//           </nav>

//           {/* Footer Actions */}
//           <div className="p-4 border-t border-slate-700/50 backdrop-blur-sm space-y-2">
//             {/* User Info - Enhanced Design */}
//             {!isCollapsed && isAuthenticated && (
//               <div className="mb-3 p-4 bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/60 transition-all">
//                 <div className="flex items-center space-x-3">
//                   <div className="relative">
//                     <div className="w-12 h-12 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-500/30 ring-2 ring-slate-800 ring-offset-2 ring-offset-slate-900">
//                       {getUserInitials()}
//                     </div>
//                     <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg">
//                       <Shield className="w-3 h-3 text-white" />
//                     </div>
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-bold text-white truncate flex items-center gap-1.5">
//                       {getUserDisplayName()}
//                       <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
//                     </p>
//                     <div className="flex items-center gap-2 mt-1.5 flex-wrap">
//                       <span className="px-2.5 py-0.5 bg-gradient-to-r from-slate-700/80 to-slate-600/80 text-slate-200 text-xs rounded-md font-medium border border-slate-600/50 shadow-sm">
//                         {getUserRoleDisplay()}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Collapsed User Info */}
//             {isCollapsed && isAuthenticated && (
//               <div className="mb-3 flex justify-center">
//                 <div className="relative group cursor-pointer">
//                   <div className="w-11 h-11 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-amber-500/30 ring-2 ring-slate-800 ring-offset-2 ring-offset-slate-900 transition-transform group-hover:scale-110">
//                     {getUserInitials()}
//                   </div>
//                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg">
//                     <Shield className="w-2 h-2 text-white" />
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Quick Actions Label */}
//             {!isCollapsed && isAuthenticated && (
//               <div className="px-2 pt-2 pb-1">
//                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</p>
//               </div>
//             )}

//             {/* Change Password - Only show when authenticated */}
//             {isAuthenticated && (
//               <button
//                 onClick={handleChangePassword}
//                 className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/50 hover:border-amber-600/50 transition-all duration-200 group hover:shadow-lg hover:shadow-amber-500/10 ${
//                   isCollapsed ? 'justify-center' : ''
//                 }`}
//                 title={isCollapsed ? 'Change Password' : ''}
//               >
//                 <Lock className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors group-hover:scale-110 duration-200" />
//                 {!isCollapsed && (
//                   <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
//                     Change Password
//                   </span>
//                 )}
//               </button>
//             )}

//             {/* Logout/Login Button */}
//             {isAuthenticated ? (
//               <button
//                 onClick={handleLogout}
//                 className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200 group hover:scale-[1.02] ${
//                   isCollapsed ? 'justify-center' : ''
//                 }`}
//                 title={isCollapsed ? 'Logout' : ''}
//               >
//                 <LogOut className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
//                 {!isCollapsed && (
//                   <span className="text-sm font-semibold text-white">
//                     Logout
//                   </span>
//                 )}
//               </button>
//             ) : (
//               <button
//                 onClick={() => router.push('/Login')}
//                 className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 group hover:scale-[1.02] ${
//                   isCollapsed ? 'justify-center' : ''
//                 }`}
//                 title={isCollapsed ? 'Login' : ''}
//               >
//                 <Lock className="w-5 h-5 text-white" />
//                 {!isCollapsed && (
//                   <span className="text-sm font-semibold text-white">
//                     Login
//                   </span>
//                 )}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Overlay for mobile */}
//       {!isCollapsed && (
//         <div 
//           className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
//           onClick={() => setIsCollapsed(true)}
//         />
//       )}

//       {/* Custom scrollbar styles */}
//       <style jsx global>{`
//         .scrollbar-thin::-webkit-scrollbar {
//           width: 6px;
//         }
//         .scrollbar-thin::-webkit-scrollbar-track {
//           background: transparent;
//         }
//         .scrollbar-thin::-webkit-scrollbar-thumb {
//           background: rgb(51, 65, 85);
//           border-radius: 3px;
//         }
//         .scrollbar-thin::-webkit-scrollbar-thumb:hover {
//           background: rgb(71, 85, 105);
//         }
//         @keyframes shimmer {
//           0% {
//             transform: translateX(-100%);
//           }
//           100% {
//             transform: translateX(100%);
//           }
//         }
//         .animate-shimmer {
//           animation: shimmer 3s infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default AdminSideNavbarCom;


// 'use client';
// import { useState, useEffect, useContext } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import { Home, Users, FileText, Settings, LogOut, Lock, Eye, Menu, X, ChevronRight, User, Shield, Zap, Globe, Image, Key } from 'lucide-react';
// import { AuthContext } from '@/components/AuthContext';

// const AdminSideNavbarCom = () => {
//   const router = useRouter();
//   const pathname = usePathname();
  
//   const { isAuthenticated, user, role, logout, loading } = useContext(AuthContext);
  
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const [activeRoute, setActiveRoute] = useState('/admindashboard');
//   const [hoveredItem, setHoveredItem] = useState(null);

//   useEffect(() => {
//     console.log('Route changed to:', pathname);
//     setActiveRoute(pathname);
//   }, [pathname]);

//   useEffect(() => {
//     console.log('Auth state - isAuthenticated:', isAuthenticated, 'user:', user, 'role:', role);
//   }, [isAuthenticated, user, role]);

//   const navigationItems = [
//     {
//       id: 'dashboard',
//       label: 'Dashboard',
//       icon: Home,
//       path: '/admindashboard',
//       roles: ['admin', 'editor', 'super'],
//       color: 'blue'
//     },
//     {
//       id: 'posts',
//       label: 'Blog Posts',
//       icon: FileText,
//       path: '/blogpostpage',
//       roles: ['admin', 'editor', 'super'],
//       color: 'purple'
//     },
//     {
//       id: 'images',
//       label: 'Images',
//       icon: Image,
//       path: '/imagespage',
//       roles: ['admin', 'editor', 'guest', 'super'], // Added 'guest' role
//       color: 'red'
//     },
//     {
//       id: 'employees',
//       label: 'Employee Records',
//       icon: Users,
//       path: '/employeepage',
//       roles: ['admin', 'super'],
//       color: 'emerald'
//     },
//     {
//       id: 'roles',
//       label: 'Roles',
//       icon: Shield,
//       path: '/RolesPage',
//       roles: ['admin', 'super'],
//       color: 'red'
//     },
//     {
//       id: 'permissions',
//       label: 'Permissions',
//       icon: Key,
//       path: '/PermissionsPage',
//       roles: ['admin', 'super'],
//       color: 'emerald'
//     },
//     {
//       id: 'profile',
//       label: 'Client Profile',
//       icon: User,
//       path: '/clientselfpage',
//       roles: ['admin', 'editor', 'client', 'guest', 'super'], // Added 'guest' role
//       color: 'amber'
//     },
//     {
//       id: 'public',
//       label: 'Public Site',
//       icon: Globe,
//       path: '/',
//       roles: ['admin', 'editor', 'client', 'guest', 'super'], // Added 'guest' role
//       color: 'cyan'
//     }
//   ];

//   // Filter navigation items based on user role
//   const getFilteredNavigationItems = () => {
//     if (!role && !user) return navigationItems;
    
//     const userRole = role?.name?.toLowerCase() || user?.role_name?.toLowerCase() || user?.role?.toLowerCase();
//     console.log('Filtering for role:', userRole);
    
//     return navigationItems.filter(item => {
//       const hasAccess = item.roles.some(r => r.toLowerCase() === userRole);
//       console.log(`Item: ${item.label}, Has Access: ${hasAccess}`);
//       return hasAccess;
//     });
//   };

//   const filteredNavigationItems = getFilteredNavigationItems();

//   const handleNavigation = (path) => {
//     setActiveRoute(path);
//     router.push(path);
//   };

//   const handleLogout = async () => {
//     console.log('Logout button clicked');
//     await logout();
//     router.push('/Login');
//   };

//   const handleChangePassword = () => {
//     router.push('/changepassword');
//   };

//   const getUserInitials = () => {
//     if (user?.name) {
//       const names = user.name.trim().split(' ');
//       if (names.length >= 2) {
//         return (names[0][0] + names[names.length - 1][0]).toUpperCase();
//       }
//       return user.name.substring(0, 2).toUpperCase();
//     }
//     return 'AU';
//   };

//   const getUserDisplayName = () => {
//     return user?.name || user?.username || 'Admin User';
//   };

//   const getUserRoleDisplay = () => {
//     return role?.name || user?.role_name || user?.role || 'Guest';
//   };

//   const getColorClasses = (color, isActive, isHovered) => {
//     const colors = {
//       blue: {
//         active: 'from-blue-600 to-blue-500 shadow-blue-500/30',
//         hover: 'hover:bg-blue-500/10',
//         icon: 'group-hover:text-blue-400'
//       },
//       purple: {
//         active: 'from-purple-600 to-purple-500 shadow-purple-500/30',
//         hover: 'hover:bg-purple-500/10',
//         icon: 'group-hover:text-purple-400'
//       },
//       red: {
//         active: 'from-red-600 to-red-500 shadow-red-500/30',
//         hover: 'hover:bg-red-500/10',
//         icon: 'group-hover:text-red-400'
//       },
//       emerald: {
//         active: 'from-emerald-600 to-emerald-500 shadow-emerald-500/30',
//         hover: 'hover:bg-emerald-500/10',
//         icon: 'group-hover:text-emerald-400'
//       },
//       amber: {
//         active: 'from-amber-600 to-amber-500 shadow-amber-500/30',
//         hover: 'hover:bg-amber-500/10',
//         icon: 'group-hover:text-amber-400'
//       },
//       cyan: {
//         active: 'from-cyan-600 to-cyan-500 shadow-cyan-500/30',
//         hover: 'hover:bg-cyan-500/10',
//         icon: 'group-hover:text-cyan-400'
//       }
//     };
    
//     return colors[color] || colors.blue;
//   };

//   if (loading) {
//     return (
//       <div className="fixed top-0 left-0 h-screen w-72 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   console.log('Render - isAuthenticated:', isAuthenticated, 'Filtered Items:', filteredNavigationItems.length);

//   return (
//     <div className="relative h-screen">
//       {/* Sidebar */}
//       <div 
//         className={`fixed top-0 left-0 h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white transition-all duration-300 ease-in-out ${
//           isCollapsed ? 'w-20' : 'w-72'
//         } shadow-2xl border-r border-slate-700/50 z-50 overflow-hidden`}
//       >
//         {/* Animated background effect */}
//         <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-50"></div>
//         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
//         <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

//         <div className="relative z-10 h-full flex flex-col">
//           {/* Header */}
//           <div className="relative p-6 border-b border-slate-700/50 backdrop-blur-sm">
//             <div className="flex items-center justify-between">
//               <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
//                 <div className="relative">
//                   <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
//                     <FileText className="w-6 h-6" />
//                   </div>
//                   <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
//                 </div>
//                 {!isCollapsed && (
//                   <div className="flex flex-col">
//                     <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
//                       BlogCMS
//                     </h2>
//                     <p className="text-xs text-slate-400 font-medium">Admin Panel v2.0</p>
//                   </div>
//                 )}
//               </div>
//               {!isCollapsed && (
//                 <button
//                   onClick={() => setIsCollapsed(true)}
//                   className="p-2 hover:bg-slate-700/50 rounded-lg transition-all hover:rotate-90 duration-300"
//                   title="Collapse sidebar"
//                 >
//                   <X className="w-5 h-5 text-slate-400" />
//                 </button>
//               )}
//             </div>
//             {isCollapsed && (
//               <button
//                 onClick={() => setIsCollapsed(false)}
//                 className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-full flex items-center justify-center shadow-lg transition-all border border-slate-600 hover:scale-110"
//                 title="Expand sidebar"
//               >
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//             )}
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
//             {!isCollapsed && (
//               <div className="px-2 mb-4">
//                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigation</p>
//               </div>
//             )}
            
//             {/* Use filtered navigation items */}
//             {filteredNavigationItems.map((item) => {
//               const Icon = item.icon;
//               const isActive = activeRoute === item.path;
//               const isHovered = hoveredItem === item.id;
//               const colorClasses = getColorClasses(item.color, isActive, isHovered);
              
//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => handleNavigation(item.path)}
//                   onMouseEnter={() => setHoveredItem(item.id)}
//                   onMouseLeave={() => setHoveredItem(null)}
//                   className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
//                     isActive
//                       ? `bg-gradient-to-r ${colorClasses.active} shadow-lg`
//                       : `${colorClasses.hover} hover:shadow-md`
//                   } ${isCollapsed ? 'justify-center' : ''}`}
//                   title={isCollapsed ? item.label : ''}
//                 >
//                   {/* Active indicator */}
//                   {isActive && !isCollapsed && (
//                     <div className="absolute left-0 w-1.5 h-10 bg-white rounded-r-full shadow-lg"></div>
//                   )}
                  
//                   {/* Background shimmer effect */}
//                   {isActive && (
//                     <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 animate-shimmer"></div>
//                   )}
                  
//                   <Icon 
//                     className={`w-5 h-5 transition-all duration-200 relative z-10 ${
//                       isHovered && !isActive ? 'scale-110 rotate-3' : ''
//                     } ${isActive ? 'text-white' : `text-slate-400 ${colorClasses.icon}`}`}
//                   />
                  
//                   {!isCollapsed && (
//                     <>
//                       <span className={`flex-1 text-left font-medium relative z-10 transition-all ${
//                         isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
//                       }`}>
//                         {item.label}
//                       </span>
                      
//                       {isHovered && !isActive && (
//                         <ChevronRight className="w-4 h-4 text-slate-400 relative z-10 animate-pulse" />
//                       )}
//                     </>
//                   )}
                  
//                   {/* Collapsed active indicator */}
//                   {isCollapsed && isActive && (
//                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-t-full"></div>
//                   )}
//                 </button>
//               );
//             })}

//             {/* Show message if no items available for this role */}
//             {filteredNavigationItems.length === 0 && (
//               <div className="px-4 py-8 text-center">
//                 <p className="text-slate-400 text-sm">No menu items available for your role</p>
//               </div>
//             )}
//           </nav>

//           {/* Footer Actions */}
//           <div className="p-4 border-t border-slate-700/50 backdrop-blur-sm space-y-2">
//             {/* User Info - Enhanced Design */}
//             {!isCollapsed && isAuthenticated && (
//               <div className="mb-3 p-4 bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/60 transition-all">
//                 <div className="flex items-center space-x-3">
//                   <div className="relative">
//                     <div className="w-12 h-12 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-500/30 ring-2 ring-slate-800 ring-offset-2 ring-offset-slate-900">
//                       {getUserInitials()}
//                     </div>
//                     <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg">
//                       <Shield className="w-3 h-3 text-white" />
//                     </div>
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-bold text-white truncate flex items-center gap-1.5">
//                       {getUserDisplayName()}
//                       <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
//                     </p>
//                     <div className="flex items-center gap-2 mt-1.5 flex-wrap">
//                       <span className="px-2.5 py-0.5 bg-gradient-to-r from-slate-700/80 to-slate-600/80 text-slate-200 text-xs rounded-md font-medium border border-slate-600/50 shadow-sm">
//                         {getUserRoleDisplay()}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Collapsed User Info */}
//             {isCollapsed && isAuthenticated && (
//               <div className="mb-3 flex justify-center">
//                 <div className="relative group cursor-pointer">
//                   <div className="w-11 h-11 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-amber-500/30 ring-2 ring-slate-800 ring-offset-2 ring-offset-slate-900 transition-transform group-hover:scale-110">
//                     {getUserInitials()}
//                   </div>
//                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg">
//                     <Shield className="w-2 h-2 text-white" />
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Quick Actions Label */}
//             {!isCollapsed && isAuthenticated && (
//               <div className="px-2 pt-2 pb-1">
//                 <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</p>
//               </div>
//             )}

//             {/* Change Password - Only show when authenticated */}
//             {isAuthenticated && (
//               <button
//                 onClick={handleChangePassword}
//                 className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/50 hover:border-amber-600/50 transition-all duration-200 group hover:shadow-lg hover:shadow-amber-500/10 ${
//                   isCollapsed ? 'justify-center' : ''
//                 }`}
//                 title={isCollapsed ? 'Change Password' : ''}
//               >
//                 <Lock className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors group-hover:scale-110 duration-200" />
//                 {!isCollapsed && (
//                   <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
//                     Change Password
//                   </span>
//                 )}
//               </button>
//             )}

//             {/* Logout/Login Button */}
//             {isAuthenticated ? (
//               <button
//                 onClick={handleLogout}
//                 className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200 group hover:scale-[1.02] ${
//                   isCollapsed ? 'justify-center' : ''
//                 }`}
//                 title={isCollapsed ? 'Logout' : ''}
//               >
//                 <LogOut className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
//                 {!isCollapsed && (
//                   <span className="text-sm font-semibold text-white">
//                     Logout
//                   </span>
//                 )}
//               </button>
//             ) : (
//               <button
//                 onClick={() => router.push('/Login')}
//                 className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 group hover:scale-[1.02] ${
//                   isCollapsed ? 'justify-center' : ''
//                 }`}
//                 title={isCollapsed ? 'Login' : ''}
//               >
//                 <Lock className="w-5 h-5 text-white" />
//                 {!isCollapsed && (
//                   <span className="text-sm font-semibold text-white">
//                     Login
//                   </span>
//                 )}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Overlay for mobile */}
//       {!isCollapsed && (
//         <div 
//           className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
//           onClick={() => setIsCollapsed(true)}
//         />
//       )}

//       {/* Custom scrollbar styles */}
//       <style jsx global>{`
//         .scrollbar-thin::-webkit-scrollbar {
//           width: 6px;
//         }
//         .scrollbar-thin::-webkit-scrollbar-track {
//           background: transparent;
//         }
//         .scrollbar-thin::-webkit-scrollbar-thumb {
//           background: rgb(51, 65, 85);
//           border-radius: 3px;
//         }
//         .scrollbar-thin::-webkit-scrollbar-thumb:hover {
//           background: rgb(71, 85, 105);
//         }
//         @keyframes shimmer {
//           0% {
//             transform: translateX(-100%);
//           }
//           100% {
//             transform: translateX(100%);
//           }
//         }
//         .animate-shimmer {
//           animation: shimmer 3s infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default AdminSideNavbarCom;


'use client';
import { useState, useEffect, useContext, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Users, FileText, Settings, LogOut, Lock, Eye, Menu, X, ChevronRight, User, Shield, Zap, Globe, Image, Key, 
  ShoppingBag, Tag, MessageSquare} from 'lucide-react';
import { AuthContext } from '@/components/AuthContext';

const AdminSideNavbarCom = () => {
  const router = useRouter();
  const pathname = usePathname();
  const navRef = useRef(null); // Reference to the navigation container
  
  const { isAuthenticated, user, role, logout, loading } = useContext(AuthContext);
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeRoute, setActiveRoute] = useState('/admindashboard');
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    console.log('Route changed to:', pathname);
    setActiveRoute(pathname);
  }, [pathname]);

  useEffect(() => {
    console.log('Auth state - isAuthenticated:', isAuthenticated, 'user:', user, 'role:', role);
  }, [isAuthenticated, user, role]);

  // Restore scroll position on mount and route changes
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('sidebarScrollPosition');
    if (savedScrollPosition && navRef.current) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        navRef.current.scrollTop = parseInt(savedScrollPosition, 10);
      }, 0);
    }
  }, [pathname]); // Restore scroll when route changes

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/admindashboard',
      roles: ['admin', 'editor', 'super'],
      color: 'blue'
    },
    {
      id: 'posts',
      label: 'Blog Posts',
      icon: FileText,
      path: '/blogpostpage',
      roles: ['admin', 'editor', 'super'],
      color: 'purple'
    },
    {
      id: 'images',
      label: 'Images',
      icon: Image,
      path: '/imagespage',
      roles: ['admin', 'editor', 'guest', 'super'],
      color: 'red'
    },
    {
      id: 'employees',
      label: 'Employee Records',
      icon: Users,
      path: '/employeepage',
      roles: ['admin', 'super'],
      color: 'emerald'
    },
    {
      id: 'roles',
      label: 'Roles',
      icon: Shield,
      path: '/Roles',
      roles: ['admin', 'super'],
      color: 'red'
    },
    {
      id: 'permissions',
      label: 'Permissions',
      icon: Key,
      path: '/PermissionsPage',
      roles: ['admin', 'super'],
      color: 'emerald'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      roles: ['admin', 'editor', 'client', 'guest', 'super'],
      color: 'amber'
    },
    {
      id: 'public',
      label: 'Public Site',
      icon: Globe,
      path: '/',
      roles: ['admin', 'editor', 'client', 'guest', 'super'],
      color: 'cyan'
    }
  ];

  // Filter navigation items based on user role
  const getFilteredNavigationItems = () => {
    if (!role && !user) return navigationItems;
    
    const userRole = role?.name?.toLowerCase() || user?.role_name?.toLowerCase() || user?.role?.toLowerCase();
    console.log('Filtering for role:', userRole);
    
    return navigationItems.filter(item => {
      const hasAccess = item.roles.some(r => r.toLowerCase() === userRole);
      console.log(`Item: ${item.label}, Has Access: ${hasAccess}`);
      return hasAccess;
    });
  };

  const filteredNavigationItems = getFilteredNavigationItems();

  const handleNavigation = (path) => {
    // Save current scroll position before navigation
    if (navRef.current) {
      sessionStorage.setItem('sidebarScrollPosition', navRef.current.scrollTop.toString());
    }
    
    setActiveRoute(path);
    router.push(path);
  };

  // Save scroll position on scroll
  const handleScroll = () => {
    if (navRef.current) {
      sessionStorage.setItem('sidebarScrollPosition', navRef.current.scrollTop.toString());
    }
  };

  const handleLogout = async () => {
    console.log('Logout button clicked');
    // Clear scroll position on logout
    sessionStorage.removeItem('sidebarScrollPosition');
    await logout();
    router.push('/login');
  };

  const handleChangePassword = () => {
    // Save scroll position before navigation
    if (navRef.current) {
      sessionStorage.setItem('sidebarScrollPosition', navRef.current.scrollTop.toString());
    }
    router.push('/changepassword');
  };

  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.trim().split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return 'AU';
  };

  const getUserDisplayName = () => {
    return user?.name || user?.username || 'Admin User';
  };

  const getUserRoleDisplay = () => {
    return role?.name || user?.role_name || user?.role || 'Guest';
  };

  const getColorClasses = (color, isActive, isHovered) => {
    const colors = {
      blue: {
        active: 'from-blue-600 to-blue-500 shadow-blue-500/30',
        hover: 'hover:bg-blue-500/10',
        icon: 'group-hover:text-blue-400'
      },
      purple: {
        active: 'from-purple-600 to-purple-500 shadow-purple-500/30',
        hover: 'hover:bg-purple-500/10',
        icon: 'group-hover:text-purple-400'
      },
      red: {
        active: 'from-red-600 to-red-500 shadow-red-500/30',
        hover: 'hover:bg-red-500/10',
        icon: 'group-hover:text-red-400'
      },
      emerald: {
        active: 'from-emerald-600 to-emerald-500 shadow-emerald-500/30',
        hover: 'hover:bg-emerald-500/10',
        icon: 'group-hover:text-emerald-400'
      },
      amber: {
        active: 'from-amber-600 to-amber-500 shadow-amber-500/30',
        hover: 'hover:bg-amber-500/10',
        icon: 'group-hover:text-amber-400'
      },
      cyan: {
        active: 'from-cyan-600 to-cyan-500 shadow-cyan-500/30',
        hover: 'hover:bg-cyan-500/10',
        icon: 'group-hover:text-cyan-400'
      }
    };
    
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="fixed top-0 left-0 h-screen w-72 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  console.log('Render - isAuthenticated:', isAuthenticated, 'Filtered Items:', filteredNavigationItems.length);

  return (
    <div className="relative h-screen">
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-72'
        } shadow-2xl border-r border-slate-700/50 z-50 overflow-hidden`}
      >
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-50"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="relative p-6 border-b border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                <div className="relative">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      BlogCMS
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">Admin Panel v2.0</p>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-all hover:rotate-90 duration-300"
                  title="Collapse sidebar"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              )}
            </div>
            {isCollapsed && (
              <button
                onClick={() => setIsCollapsed(false)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-full flex items-center justify-center shadow-lg transition-all border border-slate-600 hover:scale-110"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation - Added ref and onScroll handler */}
          <nav 
            ref={navRef}
            onScroll={handleScroll}
            className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
          >
            {!isCollapsed && (
              <div className="px-2 mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigation</p>
              </div>
            )}
            
            {/* Use filtered navigation items */}
            {filteredNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.path;
              const isHovered = hoveredItem === item.id;
              const colorClasses = getColorClasses(item.color, isActive, isHovered);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? `bg-gradient-to-r ${colorClasses.active} shadow-lg`
                      : `${colorClasses.hover} hover:shadow-md`
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  {/* Active indicator */}
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 w-1.5 h-10 bg-white rounded-r-full shadow-lg"></div>
                  )}
                  
                  {/* Background shimmer effect */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 animate-shimmer"></div>
                  )}
                  
                  <Icon 
                    className={`w-5 h-5 transition-all duration-200 relative z-10 ${
                      isHovered && !isActive ? 'scale-110 rotate-3' : ''
                    } ${isActive ? 'text-white' : `text-slate-400 ${colorClasses.icon}`}`}
                  />
                  
                  {!isCollapsed && (
                    <>
                      <span className={`flex-1 text-left font-medium relative z-10 transition-all ${
                        isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`}>
                        {item.label}
                      </span>
                      
                      {isHovered && !isActive && (
                        <ChevronRight className="w-4 h-4 text-slate-400 relative z-10 animate-pulse" />
                      )}
                    </>
                  )}
                  
                  {/* Collapsed active indicator */}
                  {isCollapsed && isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-t-full"></div>
                  )}
                </button>
              );
            })}

            {/* Show message if no items available for this role */}
            {filteredNavigationItems.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-slate-400 text-sm">No menu items available for your role</p>
              </div>
            )}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-700/50 backdrop-blur-sm space-y-2">
            {/* User Info - Enhanced Design */}
            {!isCollapsed && isAuthenticated && (
              <div className="mb-3 p-4 bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/60 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-500/30 ring-2 ring-slate-800 ring-offset-2 ring-offset-slate-900">
                      {getUserInitials()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                      {getUserDisplayName()}
                      <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-gradient-to-r from-slate-700/80 to-slate-600/80 text-slate-200 text-xs rounded-md font-medium border border-slate-600/50 shadow-sm">
                        {getUserRoleDisplay()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Collapsed User Info */}
            {isCollapsed && isAuthenticated && (
              <div className="mb-3 flex justify-center">
                <div className="relative group cursor-pointer">
                  <div className="w-11 h-11 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-amber-500/30 ring-2 ring-slate-800 ring-offset-2 ring-offset-slate-900 transition-transform group-hover:scale-110">
                    {getUserInitials()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg">
                    <Shield className="w-2 h-2 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions Label */}
            {!isCollapsed && isAuthenticated && (
              <div className="px-2 pt-2 pb-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</p>
              </div>
            )}

            {/* Change Password - Only show when authenticated */}
            {isAuthenticated && (
              <button
                onClick={handleChangePassword}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/50 hover:border-amber-600/50 transition-all duration-200 group hover:shadow-lg hover:shadow-amber-500/10 ${
                  isCollapsed ? 'justify-center' : ''
                }`}
                title={isCollapsed ? 'Change Password' : ''}
              >
                <Lock className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors group-hover:scale-110 duration-200" />
                {!isCollapsed && (
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                    Change Password
                  </span>
                )}
              </button>
            )}

            {/* Logout/Login Button */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200 group hover:scale-[1.02] ${
                  isCollapsed ? 'justify-center' : ''
                }`}
                title={isCollapsed ? 'Logout' : ''}
              >
                <LogOut className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform" />
                {!isCollapsed && (
                  <span className="text-sm font-semibold text-white">
                    Logout
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 group hover:scale-[1.02] ${
                  isCollapsed ? 'justify-center' : ''
                }`}
                title={isCollapsed ? 'Login' : ''}
              >
                <Lock className="w-5 h-5 text-white" />
                {!isCollapsed && (
                  <span className="text-sm font-semibold text-white">
                    Login
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgb(51, 65, 85);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgb(71, 85, 105);
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminSideNavbarCom;