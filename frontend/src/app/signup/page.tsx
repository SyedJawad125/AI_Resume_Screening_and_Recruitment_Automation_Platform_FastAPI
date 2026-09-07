// 'use client';
// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import AxiosInstance from "@/components/AxiosInstance";

// const SignUp = () => {
//   const router = useRouter();
//   const [first_name, setfirst_name] = useState('');
//   const [last_name, setlast_name] = useState('');
//   const [username, setusername] = useState('');
//   const [email, setemail] = useState('');
//   const [phone, setphone] = useState('');
//   const [password, setpassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     // Basic validation
//     if (!first_name || !last_name || !username || !email || !phone || !password) {
//       setError('Please fill in all fields');
//       setLoading(false);
//       return;
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       setError('Please enter a valid email address');
//       setLoading(false);
//       return;
//     }

//     const payload = {
//       first_name: first_name,
//       last_name: last_name,
//       username: username,
//       email: email,
//       phone: phone,
//       password: password
//     };

//     try {
//       const response = await AxiosInstance.post('/user/register', payload);

//       if (response) {
//         console.log('Response:', response.data);
//         router.push('/Login');
//       }
//     } catch (err) {
//       console.error('Error:', err);
//       if (err.response) {
//         const errorMessage = err.response.data?.message 
//           || err.response.data?.detail 
//           || err.response.data?.error
//           || 'Registration failed. Please try again.';
//         setError(errorMessage);
//       } else if (err.request) {
//         setError('Unable to connect to server. Please check your connection.');
//       } else {
//         setError('An unexpected error occurred. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
//       {/* Animated background elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -inset-10 opacity-20">
//           <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-3xl animate-pulse"></div>
//           <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
//         </div>
//       </div>

//       <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
//         {/* Decorative header */}
//         <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400"></div>
        
//         <div className="p-8">
//           {/* Logo/Brand */}
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-lg mb-4">
//               <span className="text-2xl font-bold text-white">S</span>
//             </div>
//             <h2 className="text-3xl font-light text-white tracking-wide">
//               Create Account
//             </h2>
//             <p className="text-white/60 text-sm mt-2 font-light">
//               Join us and start your journey
//             </p>
//           </div>
          
//           {/* Error Message */}
//           {error && (
//             <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/30 text-white rounded-xl backdrop-blur-sm">
//               <div className="flex items-center">
//                 <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                 </svg>
//                 {error}
//               </div>
//             </div>
//           )}
          
//           <div className="space-y-5">
//             {/* Name Fields */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="group">
//                 <label 
//                   htmlFor="first_name" 
//                   className="block text-sm font-medium text-white/80 mb-2 transition-all duration-300 group-focus-within:text-amber-300"
//                 >
//                   First Name
//                 </label>
//                 <input
//                   type="text"
//                   id="first_name"
//                   name="first_name"
//                   value={first_name}
//                   onChange={(e) => {
//                     setfirst_name(e.target.value);
//                     if (error) setError('');
//                   }}
//                   className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/30 transition-all duration-300 backdrop-blur-sm"
//                   placeholder="John"
//                   required
//                   disabled={loading}
//                 />
//               </div>

//               <div className="group">
//                 <label 
//                   htmlFor="last_name" 
//                   className="block text-sm font-medium text-white/80 mb-2 transition-all duration-300 group-focus-within:text-amber-300"
//                 >
//                   Last Name
//                 </label>
//                 <input
//                   type="text"
//                   id="last_name"
//                   name="last_name"
//                   value={last_name}
//                   onChange={(e) => {
//                     setlast_name(e.target.value);
//                     if (error) setError('');
//                   }}
//                   className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/30 transition-all duration-300 backdrop-blur-sm"
//                   placeholder="Doe"
//                   required
//                   disabled={loading}
//                 />
//               </div>
//             </div>

//             {/* Username Field */}
//             <div className="group">
//               <label 
//                 htmlFor="username" 
//                 className="block text-sm font-medium text-white/80 mb-2 transition-all duration-300 group-focus-within:text-cyan-300"
//               >
//                 Username
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   id="username"
//                   name="username"
//                   value={username}
//                   onChange={(e) => {
//                     setusername(e.target.value);
//                     if (error) setError('');
//                   }}
//                   className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/30 transition-all duration-300 backdrop-blur-sm"
//                   placeholder="johndoe"
//                   required
//                   disabled={loading}
//                 />
//                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
            
//             {/* Email Field */}
//             <div className="group">
//               <label 
//                 htmlFor="email" 
//                 className="block text-sm font-medium text-white/80 mb-2 transition-all duration-300 group-focus-within:text-amber-300"
//               >
//                 Email Address
//               </label>
//               <div className="relative">
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   value={email}
//                   onChange={(e) => {
//                     setemail(e.target.value);
//                     if (error) setError('');
//                   }}
//                   className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/30 transition-all duration-300 backdrop-blur-sm"
//                   placeholder="john@example.com"
//                   required
//                   disabled={loading}
//                 />
//                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             {/* Phone Field */}
//             <div className="group">
//               <label 
//                 htmlFor="phone" 
//                 className="block text-sm font-medium text-white/80 mb-2 transition-all duration-300 group-focus-within:text-cyan-300"
//               >
//                 Phone Number
//               </label>
//               <div className="relative">
//                 <input
//                   type="tel"
//                   id="phone"
//                   name="phone"
//                   value={phone}
//                   onChange={(e) => {
//                     setphone(e.target.value);
//                     if (error) setError('');
//                   }}
//                   className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/30 transition-all duration-300 backdrop-blur-sm"
//                   placeholder="+1 (555) 000-0000"
//                   required
//                   disabled={loading}
//                 />
//                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
            
//             {/* Password Field */}
//             <div className="group">
//               <label 
//                 htmlFor="password" 
//                 className="block text-sm font-medium text-white/80 mb-2 transition-all duration-300 group-focus-within:text-amber-300"
//               >
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   type="password"
//                   id="password"
//                   name="password"
//                   value={password}
//                   onChange={(e) => {
//                     setpassword(e.target.value);
//                     if (error) setError('');
//                   }}
//                   className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/30 transition-all duration-300 backdrop-blur-sm"
//                   placeholder="Create a strong password"
//                   required
//                   disabled={loading}
//                 />
//                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40">
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                   </svg>
//                 </div>
//               </div>
//             </div>
            
//             {/* Terms & Conditions */}
//             <div className="flex items-start">
//               <input 
//                 type="checkbox" 
//                 id="terms"
//                 required
//                 className="rounded bg-white/10 border-white/20 text-cyan-400 focus:ring-cyan-400/50 mt-1" 
//               />
//               <label htmlFor="terms" className="ml-2 text-white/70 text-sm">
//                 I agree to the{' '}
//                 <a href="/terms" className="text-cyan-300 hover:text-cyan-200 underline">
//                   Terms and Conditions
//                 </a>
//                 {' '}and{' '}
//                 <a href="/privacy" className="text-cyan-300 hover:text-cyan-200 underline">
//                   Privacy Policy
//                 </a>
//               </label>
//             </div>
            
//             {/* Submit Button */}
//             <button
//               onClick={handleSubmit}
//               disabled={loading}
//               className={`w-full py-4 px-6 rounded-xl font-medium text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
//                 loading 
//                   ? 'bg-gray-500 cursor-not-allowed' 
//                   : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-cyan-500/25'
//               }`}
//             >
//               {loading ? (
//                 <span className="flex items-center justify-center">
//                   <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
//                     <circle 
//                       className="opacity-25" 
//                       cx="12" 
//                       cy="12" 
//                       r="10" 
//                       stroke="currentColor" 
//                       strokeWidth="4"
//                       fill="none"
//                     />
//                     <path 
//                       className="opacity-75" 
//                       fill="currentColor" 
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     />
//                   </svg>
//                   Creating account...
//                 </span>
//               ) : (
//                 <span className="flex items-center justify-center">
//                   Create Account
//                   <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                   </svg>
//                 </span>
//               )}
//             </button>
//           </div>
          
//           {/* Divider */}
//           <div className="relative my-6">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-white/10"></div>
//             </div>
//             <div className="relative flex justify-center text-sm">
//               <span className="px-2 text-white/40 bg-transparent">Or sign up with</span>
//             </div>
//           </div>
          
//           {/* Social Sign Up */}
//           <div className="grid grid-cols-2 gap-4 mb-6">
//             <button 
//               type="button"
//               className="flex items-center justify-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
//             >
//               <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
//                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//               </svg>
//               Google
//             </button>
//             <button 
//               type="button"
//               className="flex items-center justify-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
//             >
//               <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
//               </svg>
//               Twitter
//             </button>
//           </div>
          
//           {/* Sign In Link */}
//           <div className="text-center">
//             <span className="text-white/60 text-sm">
//               Already have an account?{' '}
//             </span>
//             <a 
//               href="/Login" 
//               className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors duration-300 font-medium hover:underline"
//             >
//               Sign in
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignUp;





'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AxiosInstance from "@/components/AxiosInstance";
import GoogleLoginButton from '@/components/GoogleLoginButton'; // ← ADD THIS IMPORT

const SignUp = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    // Check if all required fields are filled
    if (!formData.first_name || !formData.last_name || !formData.username || 
        !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all fields');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation (basic)
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid phone number');
      return false;
    }

    // Password strength validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    // Password confirmation
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Terms acceptance
    if (!acceptedTerms) {
      setError('Please accept the Terms and Conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    // Prepare payload (exclude confirmPassword)
    const { confirmPassword, ...payload } = formData;

    try {
      console.log('Attempting registration with:', { ...payload, password: '***' });
      
      const response = await AxiosInstance.post('/user/register', payload);

      if (response) {
        console.log('Registration successful:', response.data);
        
        // Show success message or redirect
        router.push('/Login?registered=true');
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response) {
        // Handle specific error cases
        const errorMessage = err.response.data?.message 
          || err.response.data?.detail 
          || err.response.data?.error
          || 'Registration failed. Please try again.';
        
        // Check for specific errors
        if (errorMessage.toLowerCase().includes('username')) {
          setError('Username already exists. Please choose another.');
        } else if (errorMessage.toLowerCase().includes('email')) {
          setError('Email already registered. Please login instead.');
        } else {
          setError(errorMessage);
        }
      } else if (err.request) {
        setError('Unable to connect to server. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Decorative header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400"></div>
        
        <div className="p-8">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-lg mb-4">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <h2 className="text-3xl font-light text-white tracking-wide">
              Create Account
            </h2>
            <p className="text-white/60 text-sm mt-2 font-light">
              Join us and start your journey
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/30 text-white rounded-xl backdrop-blur-sm animate-shake">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label 
                  htmlFor="first_name" 
                  className="block text-sm font-medium text-white/80 mb-2 transition-all duration-300 group-focus-within:text-amber-300"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/30 transition-all duration-300 backdrop-blur-sm"
                  placeholder="John"
                  required
                  disabled={loading}
                />
              </div>

              <div className="group">
                <label 
                  htmlFor="last_name" 
                  className="block text-sm font-medium text-white/80 mb-2 transition-all duration-300 group-focus-within:text-amber-300"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/30 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Doe"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Username Field */}
            <div className="group">
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-white/80 mb-2 transition-all duration-300 group-focus-within:text-cyan-300"
              >
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/30 transition-all duration-300 backdrop-blur-sm"
                  placeholder="johndoe"
                  required
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Email Field */}
            <div className="group">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-white/80 mb-2 transition-all duration-300 group-focus-within:text-amber-300"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/30 transition-all duration-300 backdrop-blur-sm"
                  placeholder="john@example.com"
                  required
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Phone Field */}
            <div className="group">
              <label 
                htmlFor="phone" 
                className="block text-sm font-medium text-white/80 mb-2 transition-all duration-300 group-focus-within:text-cyan-300"
              >
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/30 transition-all duration-300 backdrop-blur-sm"
                  placeholder="+1 (555) 000-0000"
                  required
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-white/80 mb-2 transition-all duration-300 group-focus-within:text-amber-300"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/30 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Min. 8 characters"
                    required
                    disabled={loading}
                    minLength={8}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="group">
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium text-white/80 mb-2 transition-all duration-300 group-focus-within:text-cyan-300"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/30 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Re-enter password"
                    disabled={loading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Password strength indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs">
                  <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    formData.password.length < 8 ? 'bg-rose-500' : 
                    formData.password.length < 12 ? 'bg-amber-500' : 
                    'bg-emerald-500'
                  }`}></div>
                  <span className={`text-white/60 ${
                    formData.password.length < 8 ? 'text-rose-400' : 
                    formData.password.length < 12 ? 'text-amber-400' : 
                    'text-emerald-400'
                  }`}>
                    {formData.password.length < 8 ? 'Weak' : 
                     formData.password.length < 12 ? 'Medium' : 
                     'Strong'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Terms & Conditions */}
            <div className="flex items-start">
              <input 
                type="checkbox" 
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  if (error) setError('');
                }}
                className="rounded bg-white/10 border-white/20 text-cyan-400 focus:ring-cyan-400/50 mt-1 cursor-pointer" 
              />
              <label htmlFor="terms" className="ml-2 text-white/70 text-sm cursor-pointer">
                I agree to the{' '}
                <a href="/terms" className="text-cyan-300 hover:text-cyan-200 underline" onClick={(e) => e.stopPropagation()}>
                  Terms and Conditions
                </a>
                {' '}and{' '}
                <a href="/privacy" className="text-cyan-300 hover:text-cyan-200 underline" onClick={(e) => e.stopPropagation()}>
                  Privacy Policy
                </a>
              </label>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-medium text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                loading 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-cyan-500/25'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
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
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Create Account
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </form>
          
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-white/40 bg-transparent">Or sign up with</span>
            </div>
          </div>
          
          {/* ============================================
              UPDATED: Google Login Button
              REMOVED: Dummy Google and Twitter buttons
              ADDED: Real GoogleLoginButton component
              ============================================ */}
          <div className="mb-6">
            <GoogleLoginButton />
          </div>
          
          {/* Sign In Link */}
          <div className="text-center">
            <span className="text-white/60 text-sm">
              Already have an account?{' '}
            </span>
            <a 
              href="/Login" 
              className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors duration-300 font-medium hover:underline"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;