// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import './globals.css';
// import { ReactNode } from 'react';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// // import SessionProviderWrapper from '@/components/SessionProviderWrapper';
// import AuthProvider from '@/components/AuthProvider'; // Keep AuthProvider

// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'My Application',
//   description: 'My awesome app built with Next.js 14',
// };

// interface RootLayoutProps {
//   children: ReactNode;
//   session: any; // Adjust according to your session type
// }

// export default function RootLayout({ children, session }: RootLayoutProps) {
//   return (
//     // <SessionProviderWrapper session={session}>
//       <AuthProvider>
//           <html lang="en" className={inter.className}>
//             <body>
//               {children}
//               <ToastContainer />
//             </body>
//           </html>
//       </AuthProvider>
//     // </SessionProviderWrapper>
//   );
// }









// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import './globals.css';
// import { ReactNode } from 'react';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// // import SessionProviderWrapper from '@/components/SessionProviderWrapper';
// import AuthProvider from '@/components/AuthProvider';
// import HeaderComponent from '@/components/HeaderComponent';
// import { CartProvider } from '@/components/CartContext';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'My Application',
//   description: 'My awesome app built with Next.js 14',
// };

// interface RootLayoutProps {
//   children: ReactNode;
//   session?: any; // Made optional with ?
// }

// export default function RootLayout({ children, session }: RootLayoutProps) {
//   return (
//     <AuthProvider>
//                   {/* <CartProvider> */}

//       <html lang="en" className={inter.className}>
//         <body>
//           {/* <HeaderComponent /> */}
//                   <CartProvider>

//           <main>
//             {children}
//           </main>
//                   </CartProvider>

//           <ToastContainer />
//         </body>
//       </html>
//                   {/* </CartProvider> */}

//     </AuthProvider>
//   );
// }




import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthProvider from '@/components/AuthProvider';
// import HeaderComponent from '@/components/HeaderComponent'; // Keep commented if SalesDetail has its own nav

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Application',
  description: 'My awesome app built with Next.js 14',
};

interface RootLayoutProps {
  children: ReactNode;
  session?: any;
}

export default function RootLayout({ children, session }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <AuthProvider>
          {/* <CartProvider> */}
            {/* Do NOT add HeaderComponent here if your pages have their own navbars */}
            {children}
            <ToastContainer />
          {/* </CartProvider> */}
        </AuthProvider>
      </body>
    </html>
  );
}