'use client'
import Image from "next/image";
import Link from 'next/link';
import NavbarCom from "@/components/NavbarCom";
import TopNavbarCom from "@/components/TopNavbarCom";
import FooterCom from "@/components/FooterCom";
import BannerSliderHomeCom from "@/components/BannerSliderHomeCom";
// import LeftSideSliderCom from "@/components/LeftSideSliderCom";
// import PublicBlogHomeCom from "@/components/PublicBlogHomeCom";
import ContentpageHome from "@/components/ContentpageHome";

import HeaderComponent from "@/components/HeaderComponent";


export default function Home() {
  return (
    <>
    {/* <AdModal /> */}
    {/* <TopNavbarCom /> */}
    {/* <NavbarCom /> */}
    <HeaderComponent/>
    <BannerSliderHomeCom />
    {/* <PublicBlogHomeCom /> */}
    {/* <LeftSideSliderCom /> */}
    {/* <ContentpageHome/> */}
    <FooterCom />
  </>
  );
}