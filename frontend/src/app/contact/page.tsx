import React from 'react'
import NavbarCom from "@/components/NavbarCom";
import Contact from "@/components/Contact";
import TopNavbarCom from "@/components/TopNavbarCom";
import FooterCom from "@/components/FooterCom";
import HeaderComponent from '@/components/HeaderComponent';


const page = () => {
  return (
    <div>
      {/* <TopNavbarCom/>
      <NavbarCom/> */}
      <HeaderComponent/>
      <Contact/>
      {/* <FooterCom/> */}
    </div>
  )
}

export default page