'use client'
import React from 'react'
import AdminSideNavbarCom from "@/components/AdminSideNavbarCom";
import BlogPostCom from "@/components/BlogPostCom";

const AdminDashboard = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar - Fixed percentage width with constraints */}
      <div className="w-[18%] min-w-[280px] max-w-[320px] flex-shrink-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <AdminSideNavbarCom />
      </div>
      
      {/* Main Content - Takes remaining space */}
      <div className="flex-1 w-[82%] bg-black overflow-auto -ml-6 mr" >
        <div className="w-full h-full p-6">
          <BlogPostCom />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard;