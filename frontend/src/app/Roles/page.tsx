'use client'
import React from 'react'
import AdminSideNavbarCom from "@/components/AdminSideNavbarCom";
import RolesCom from "@/components/RolesCom";


const page = () => {
  return (
    <div className="flex h-screen">
      <div className="w-[16%] bg-gray-800 text-white">
        <AdminSideNavbarCom />
      </div>
      <div className="w-[84%] p-6 bg-black">
      <RolesCom/> 
      </div>
    </div> 
  )
}

export default page
