// 'use client'
// import React from 'react'
// import AdminSideNavbarCom from "@/components/AdminSideNavbarCom";
// import AdminDashboardCom from "@/components/AdminDashboardCom";


// const AdminDashborad = () => {
//   return (
//     <div className="flex h-screen">
      
//       <div className="w-[15%] bg-gray-800 text-white">
//         <AdminSideNavbarCom />
//       </div>
//       <div className="w-[85%] p-6 bg-black">
//         <AdminDashboardCom />
//       </div>
//     </div> 
//   )
// }

// export default AdminDashborad



'use client'
import React from 'react'
import AdminSideNavbarCom from "@/components/AdminSideNavbarCom";
import AdminDashboardCom from "@/components/AdminDashboardCom";

const AdminDashboard = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar - Fixed percentage width with constraints */}
      <div className="w-[18%] min-w-[280px] max-w-[320px] flex-shrink-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <AdminSideNavbarCom />
      </div>
      
      {/* Main Content - Takes remaining space */}
      <div className="flex-1 w-[82%] bg-black overflow-auto -ml-6" >
        <div className="w-full h-full p-6">
          <AdminDashboardCom />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard;