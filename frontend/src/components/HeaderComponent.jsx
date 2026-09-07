'use client';
import React, { useState, useEffect } from 'react';
import TopNavbarCom from './TopNavbarCom';
import NavbarCom from './NavbarCom';

const HeaderComponent = () => {
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const [isNavbarSticky, setIsNavbarSticky] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide top bar based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsTopBarVisible(false);
      } else {
        // Scrolling up
        setIsTopBarVisible(true);
      }

      // Make navbar sticky when scrolled past a certain point
      if (currentScrollY > 150) {
        setIsNavbarSticky(true);
      } else {
        setIsNavbarSticky(false);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle the scroll event for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [lastScrollY]);

  return (
    <header className="relative">
      <TopNavbarCom visible={isTopBarVisible} />
      <NavbarCom isSticky={isNavbarSticky} />
      
      {/* Add padding when navbar becomes sticky to prevent content jump */}
      {isNavbarSticky && <div className="h-16"></div>}
    </header>
  );
};

export default HeaderComponent;