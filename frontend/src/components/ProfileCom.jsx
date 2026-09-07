// 'use client';
// import { useContext, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { AuthContext } from '@/components/AuthContext';
// import AxiosInstance from '@/components/AxiosInstance';

// const Profile = () => {
//   const { user, logout } = useContext(AuthContext);
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState('personal');
//   const [loading, setLoading] = useState(true);
//   const [userData, setUserData] = useState(null);

//   useEffect(() => {
//     // Check if user is logged in
//     if (!user) {
//       router.push('/login');
//       return;
//     }

//     // Set user data from context
//     setUserData(user);
//     setLoading(false);
//   }, [user, router]);

//   const handleChangePassword = () => {
//     router.push('/changepassword');
//   };

//   const handleLogout = () => {
//     logout();
//     router.push('/login');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//         <div className="flex flex-col items-center">
//           <svg className="animate-spin h-12 w-12 text-amber-400" viewBox="0 0 24 24">
//             <circle 
//               className="opacity-25" 
//               cx="12" 
//               cy="12" 
//               r="10" 
//               stroke="currentColor" 
//               strokeWidth="4"
//               fill="none"
//             />
//             <path 
//               className="opacity-75" 
//               fill="currentColor" 
//               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//             />
//           </svg>
//           <p className="mt-4 text-white/70">Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!userData) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
//       {/* Animated background elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -inset-10 opacity-20">
//           <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-3xl animate-pulse"></div>
//           <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto relative">
//         {/* Header Section */}
//         <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden mb-6">
//           <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400"></div>
          
//           <div className="p-8">
//             <div className="flex items-start justify-between">
//               <div className="flex items-center space-x-6">
//                 {/* Profile Avatar */}
//                 <div className="relative">
//                   <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg flex items-center justify-center">
//                     <span className="text-4xl font-bold text-white">
//                       {userData.data?.username?.charAt(0).toUpperCase() || 'U'}
//                     </span>
//                   </div>
//                   <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-slate-900 rounded-full"></div>
//                 </div>

//                 {/* User Info */}
//                 <div>
//                   <h1 className="text-3xl font-bold text-white mb-2">
//                     {userData.data?.first_name && userData.data?.last_name 
//                       ? `${userData.data.first_name} ${userData.data.last_name}`
//                       : userData.data?.username || 'User'}
//                   </h1>
//                   <p className="text-white/70 text-lg mb-2">
//                     {userData.data?.email || userData.data?.username}
//                   </p>
//                   <div className="flex items-center space-x-3">
//                     <span className="inline-flex items-center px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm">
//                       <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//                       </svg>
//                       {userData.data?.role || 'User'}
//                     </span>
//                     <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm">
//                       <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                       </svg>
//                       Active
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex space-x-3">
//                 <button
//                   onClick={handleChangePassword}
//                   className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300 flex items-center space-x-2"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
//                   </svg>
//                   <span>Change Password</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden mb-6">
//           <div className="flex border-b border-white/10">
//             <button
//               onClick={() => setActiveTab('personal')}
//               className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
//                 activeTab === 'personal'
//                   ? 'text-white bg-white/10 border-b-2 border-amber-400'
//                   : 'text-white/60 hover:text-white/90 hover:bg-white/5'
//               }`}
//             >
//               <div className="flex items-center justify-center space-x-2">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                 </svg>
//                 <span>Personal Information</span>
//               </div>
//             </button>
//             <button
//               onClick={() => setActiveTab('role')}
//               className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
//                 activeTab === 'role'
//                   ? 'text-white bg-white/10 border-b-2 border-amber-400'
//                   : 'text-white/60 hover:text-white/90 hover:bg-white/5'
//               }`}
//             >
//               <div className="flex items-center justify-center space-x-2">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                 </svg>
//                 <span>Role & Permissions</span>
//               </div>
//             </button>
//             <button
//               onClick={() => setActiveTab('security')}
//               className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
//                 activeTab === 'security'
//                   ? 'text-white bg-white/10 border-b-2 border-amber-400'
//                   : 'text-white/60 hover:text-white/90 hover:bg-white/5'
//               }`}
//             >
//               <div className="flex items-center justify-center space-x-2">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                 </svg>
//                 <span>Security</span>
//               </div>
//             </button>
//           </div>
//         </div>

//         {/* Tab Content */}
//         <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
//           <div className="p-8">
//             {/* Personal Information Tab */}
//             {activeTab === 'personal' && (
//               <div className="space-y-6 animate-fade-in">
//                 <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
//                   <svg className="w-6 h-6 mr-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                   </svg>
//                   Personal Information
//                 </h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <InfoCard
//                     icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                     </svg>}
//                     label="Username"
//                     value={userData.data?.username || 'N/A'}
//                   />
                  
//                   <InfoCard
//                     icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                     </svg>}
//                     label="Email Address"
//                     value={userData.data?.email || userData.data?.username || 'N/A'}
//                   />
                  
//                   <InfoCard
//                     icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                     </svg>}
//                     label="First Name"
//                     value={userData.data?.first_name || 'N/A'}
//                   />
                  
//                   <InfoCard
//                     icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                     </svg>}
//                     label="Last Name"
//                     value={userData.data?.last_name || 'N/A'}
//                   />
                  
//                   <InfoCard
//                     icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                     </svg>}
//                     label="Phone Number"
//                     value={userData.data?.phone || 'N/A'}
//                   />
                  
//                   <InfoCard
//                     icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                     </svg>}
//                     label="Date Joined"
//                     value={userData.data?.date_joined ? new Date(userData.data.date_joined).toLocaleDateString() : 'N/A'}
//                   />
                  
//                   <InfoCard
//                     icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>}
//                     label="Account Status"
//                     value={userData.data?.is_active ? 'Active' : 'Inactive'}
//                     valueClassName={userData.data?.is_active ? 'text-emerald-400' : 'text-rose-400'}
//                   />
                  
//                   <InfoCard
//                     icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>}
//                     label="User ID"
//                     value={userData.data?.id || userData.data?.user_id || 'N/A'}
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Role & Permissions Tab */}
//             {activeTab === 'role' && (
//               <div className="space-y-6 animate-fade-in">
//                 <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
//                   <svg className="w-6 h-6 mr-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                   </svg>
//                   Role & Permissions
//                 </h2>

//                 <div className="space-y-6">
//                   {/* Role Section */}
//                   <div className="bg-white/5 border border-white/10 rounded-xl p-6">
//                     <h3 className="text-lg font-medium text-white mb-4 flex items-center">
//                       <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                       Current Role
//                     </h3>
//                     <div className="flex items-center space-x-3">
//                       <div className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg">
//                         <span className="text-amber-300 font-medium text-lg">
//                           {userData.data?.role || 'User'}
//                         </span>
//                       </div>
//                       {userData.data?.is_superuser && (
//                         <div className="px-4 py-2 bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/30 rounded-lg">
//                           <span className="text-rose-300 font-medium">Superuser</span>
//                         </div>
//                       )}
//                       {userData.data?.is_staff && (
//                         <div className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg">
//                           <span className="text-cyan-300 font-medium">Staff</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Permissions Section */}
//                   <div className="bg-white/5 border border-white/10 rounded-xl p-6">
//                     <h3 className="text-lg font-medium text-white mb-4 flex items-center">
//                       <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                       </svg>
//                       Permissions & Access Rights
//                     </h3>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <PermissionItem
//                         label="Dashboard Access"
//                         granted={true}
//                       />
//                       <PermissionItem
//                         label="View Profile"
//                         granted={true}
//                       />
//                       <PermissionItem
//                         label="Edit Profile"
//                         granted={userData.data?.can_edit_profile !== false}
//                       />
//                       <PermissionItem
//                         label="Admin Panel"
//                         granted={userData.data?.is_staff || userData.data?.is_superuser || false}
//                       />
//                       <PermissionItem
//                         label="User Management"
//                         granted={userData.data?.is_superuser || false}
//                       />
//                       <PermissionItem
//                         label="System Settings"
//                         granted={userData.data?.is_superuser || false}
//                       />
//                     </div>

//                     {userData.data?.permissions && Array.isArray(userData.data.permissions) && userData.data.permissions.length > 0 && (
//                       <div className="mt-6">
//                         <h4 className="text-sm font-medium text-white/70 mb-3">Additional Permissions:</h4>
//                         <div className="flex flex-wrap gap-2">
//                           {userData.data.permissions.map((permission, index) => (
//                             <span
//                               key={index}
//                               className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-300 text-sm"
//                             >
//                               {permission}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Security Tab */}
//             {activeTab === 'security' && (
//               <div className="space-y-6 animate-fade-in">
//                 <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
//                   <svg className="w-6 h-6 mr-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                   </svg>
//                   Security Settings
//                 </h2>

//                 <div className="space-y-4">
//                   {/* Password Section */}
//                   <div className="bg-white/5 border border-white/10 rounded-xl p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="text-lg font-medium text-white mb-2">Password</h3>
//                         <p className="text-white/60 text-sm">
//                           Last changed: {userData.data?.password_changed_at 
//                             ? new Date(userData.data.password_changed_at).toLocaleDateString()
//                             : 'Never'}
//                         </p>
//                       </div>
//                       <button
//                         onClick={handleChangePassword}
//                         className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/25"
//                       >
//                         Change Password
//                       </button>
//                     </div>
//                   </div>

//                   {/* Two-Factor Authentication */}
//                   <div className="bg-white/5 border border-white/10 rounded-xl p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="text-lg font-medium text-white mb-2">Two-Factor Authentication</h3>
//                         <p className="text-white/60 text-sm">
//                           Add an extra layer of security to your account
//                         </p>
//                       </div>
//                       <div className={`px-4 py-2 rounded-lg ${
//                         userData.data?.two_factor_enabled 
//                           ? 'bg-emerald-500/20 border border-emerald-500/30'
//                           : 'bg-gray-500/20 border border-gray-500/30'
//                       }`}>
//                         <span className={userData.data?.two_factor_enabled ? 'text-emerald-300' : 'text-gray-300'}>
//                           {userData.data?.two_factor_enabled ? 'Enabled' : 'Disabled'}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Login Activity */}
//                   <div className="bg-white/5 border border-white/10 rounded-xl p-6">
//                     <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
//                     <div className="space-y-3">
//                       <div className="flex items-center justify-between py-3 border-b border-white/10">
//                         <div className="flex items-center space-x-3">
//                           <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
//                             <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                             </svg>
//                           </div>
//                           <div>
//                             <p className="text-white font-medium">Current Session</p>
//                             <p className="text-white/60 text-sm">
//                               {userData.data?.last_login 
//                                 ? new Date(userData.data.last_login).toLocaleString()
//                                 : 'Just now'}
//                             </p>
//                           </div>
//                         </div>
//                         <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm">
//                           Active
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // InfoCard Component
// const InfoCard = ({ icon, label, value, valueClassName = "text-white" }) => (
//   <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300">
//     <div className="flex items-start space-x-3">
//       <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center flex-shrink-0 text-amber-400">
//         {icon}
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="text-white/60 text-sm mb-1">{label}</p>
//         <p className={`font-medium break-words ${valueClassName}`}>{value}</p>
//       </div>
//     </div>
//   </div>
// );

// // PermissionItem Component
// const PermissionItem = ({ label, granted }) => (
//   <div className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-lg border border-white/10">
//     <span className="text-white/80">{label}</span>
//     <div className="flex items-center space-x-2">
//       {granted ? (
//         <>
//           <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//           </svg>
//           <span className="text-emerald-400 text-sm font-medium">Granted</span>
//         </>
//       ) : (
//         <>
//           <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//           </svg>
//           <span className="text-gray-400 text-sm font-medium">Not Granted</span>
//         </>
//       )}
//     </div>
//   </div>
// );

// export default Profile;




'use client';
import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';
import AxiosInstance from '@/components/AxiosInstance';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Debug: Log what we receive from context
    console.log('User from AuthContext:', user);
    
    // Try to get user data from multiple sources
    let fetchedUserData = null;
    
    if (user) {
      fetchedUserData = user;
    } else if (typeof window !== 'undefined') {
      // Try to get from localStorage as fallback
      const storedUser = localStorage.getItem('user');
      console.log('User from localStorage:', storedUser);
      
      if (storedUser) {
        try {
          fetchedUserData = JSON.parse(storedUser);
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
    }
    
    console.log('Fetched user data:', fetchedUserData);
    
    // Check if we have user data
    if (!fetchedUserData) {
      console.log('No user data found, redirecting to login');
      router.push('/login');
      return;
    }

    // Set user data from context or localStorage
    setUserData(fetchedUserData);
    setLoading(false);
  }, [user, router]);

  const handleChangePassword = () => {
    router.push('/changepassword');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-amber-400" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-4 text-white/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Debug Section - Remove this after confirming data structure */}
        {/* {process.env.NODE_ENV === 'development' && userData && (
          <div className="bg-rose-500/20 backdrop-blur-xl border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden mb-6 p-6">
            <h3 className="text-white font-semibold mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Debug: User Data Structure (Development Only)
            </h3>
            <pre className="text-white/70 text-xs overflow-auto max-h-40 bg-black/20 p-3 rounded">
              {JSON.stringify(userData, null, 2)}
            </pre>
            <p className="text-white/60 text-sm mt-2">
              Check console for more details. This section only shows in development.
            </p>
          </div>
        )} */}

        {/* Header Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden mb-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400"></div>
          
          <div className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                {/* Profile Avatar */}
                <div className="relative">
                  {userData.profile_image ? (
                    <img 
                      src={userData.profile_image} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-2xl shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {userData.first_name?.charAt(0).toUpperCase() || userData.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-slate-900 rounded-full"></div>
                </div>

                {/* User Info */}
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.username || 'User'}
                  </h1>
                  <p className="text-white/70 text-lg mb-2">
                    {userData.email || userData.username || 'No email'}
                  </p>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {userData.role_name || userData.type || 'User'}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span>Change Password</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden mb-6">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
                activeTab === 'personal'
                  ? 'text-white bg-white/10 border-b-2 border-amber-400'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Personal Information</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('role')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
                activeTab === 'role'
                  ? 'text-white bg-white/10 border-b-2 border-amber-400'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Role & Permissions</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 ${
                activeTab === 'security'
                  ? 'text-white bg-white/10 border-b-2 border-amber-400'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Security</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoCard
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>}
                    label="Username"
                    value={userData.username || 'N/A'}
                  />
                  
                  <InfoCard
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>}
                    label="Email Address"
                    value={userData.email || 'N/A'}
                  />
                  
                  <InfoCard
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>}
                    label="First Name"
                    value={userData.first_name || 'N/A'}
                  />
                  
                  <InfoCard
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>}
                    label="Last Name"
                    value={userData.last_name || 'N/A'}
                  />
                  
                  <InfoCard
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>}
                    label="Mobile Number"
                    value={userData.mobile || 'N/A'}
                  />
                  
                  <InfoCard
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>}
                    label="User Type"
                    value={userData.type || 'N/A'}
                  />
                  
                  <InfoCard
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>}
                    label="User ID"
                    value={userData.id || 'N/A'}
                  />
                  
                  <InfoCard
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>}
                    label="Full Name"
                    value={userData.full_name || 'N/A'}
                  />
                </div>
              </div>
            )}

            {/* Role & Permissions Tab */}
            {activeTab === 'role' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Role & Permissions
                </h2>

                <div className="space-y-6">
                  {/* Role Section */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Current Role
                    </h3>
                    <div className="flex items-center space-x-3">
                      <div className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg">
                        <span className="text-amber-300 font-medium text-lg">
                          {userData.role_name || userData.type || 'User'}
                        </span>
                      </div>
                      {userData.role_id && (
                        <div className="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg">
                          <span className="text-cyan-300 font-medium">Role ID: {userData.role_id}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Permissions Section */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Permissions & Access Rights
                    </h3>
                    
                    {userData.permissions && Object.keys(userData.permissions).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(userData.permissions).map(([permission, granted]) => (
                          <PermissionItem
                            key={permission}
                            label={permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            granted={granted === true}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/60 text-center py-8">No specific permissions assigned</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Security Settings
                </h2>

                <div className="space-y-4">
                  {/* Password Section */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2">Password</h3>
                        <p className="text-white/60 text-sm">
                          Manage your account password
                        </p>
                      </div>
                      <button
                        onClick={handleChangePassword}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/25"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>

                  {/* Access Token Info */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Access Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-3 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white font-medium">Current Session</p>
                            <p className="text-white/60 text-sm">Active session</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Logout Section */}
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2">Sign Out</h3>
                        <p className="text-white/60 text-sm">
                          Sign out from your account on this device
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-rose-500/25"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// InfoCard Component
const InfoCard = ({ icon, label, value, valueClassName = "text-white" }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300">
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center flex-shrink-0 text-amber-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/60 text-sm mb-1">{label}</p>
        <p className={`font-medium break-words ${valueClassName}`}>{value}</p>
      </div>
    </div>
  </div>
);

// PermissionItem Component
const PermissionItem = ({ label, granted }) => (
  <div className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-lg border border-white/10">
    <span className="text-white/80">{label}</span>
    <div className="flex items-center space-x-2">
      {granted ? (
        <>
          <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-emerald-400 text-sm font-medium">Granted</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-400 text-sm font-medium">Not Granted</span>
        </>
      )}
    </div>
  </div>
);

export default Profile;