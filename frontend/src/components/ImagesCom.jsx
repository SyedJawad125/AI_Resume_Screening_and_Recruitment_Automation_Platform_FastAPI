// // 'use client';
// // import React, { useEffect, useState, useContext } from 'react';
// // import { ToastContainer, toast } from 'react-toastify';
// // import 'react-toastify/dist/ReactToastify.css';
// // import AxiosInstance from "@/components/AxiosInstance";
// // import { useRouter } from 'next/navigation';
// // import { AuthContext } from '@/components/AuthContext';
// // import Image from 'next/image';
// // import { Search, Plus, Filter, Edit2, Trash2, ImageIcon, Folder, Grid3x3, Eye } from 'lucide-react';

// // const ImagesCom = () => {
// //   const router = useRouter();
// //   const { permissions = {} } = useContext(AuthContext);
// //   const [images, setImages] = useState([]);
// //   const [filteredImages, setFilteredImages] = useState([]);
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [itemsPerPage, setItemsPerPage] = useState(12);

// //   // Check for permissions
// //   const hasReadPermission = permissions.read_image || permissions.READ_IMAGE;
// //   const hasCreatePermission = permissions.create_image || permissions.CREATE_IMAGE;
// //   const hasUpdatePermission = permissions.update_image || permissions.UPDATE_IMAGE;
// //   const hasDeletePermission = permissions.delete_image || permissions.DELETE_IMAGE;

// //   useEffect(() => {
// //     if (hasReadPermission) {
// //       fetchImages();
// //     }
// //   }, [hasReadPermission]);

// //   // Update filtered images when search term or images change
// //   useEffect(() => {
// //     if (searchTerm) {
// //       const filtered = images.filter(item => 
// //         item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //         item.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //         item.description?.toLowerCase().includes(searchTerm.toLowerCase())
// //       );
// //       setFilteredImages(filtered);
// //     } else {
// //       setFilteredImages(images);
// //     }
// //     setCurrentPage(1); // Reset to first page when filtering
// //   }, [searchTerm, images]);

// //   const fetchImages = async () => {
// //     if (!hasReadPermission) {
// //       toast.error('You do not have permission to view images');
// //       return;
// //     }

// //     setIsLoading(true);
// //     try {
// //       const res = await AxiosInstance.get('/api/images/v1/images/');
      
// //       // Handle the response structure from your API
// //       if (res?.data?.data && Array.isArray(res.data.data)) {
// //         setImages(res.data.data);
// //         setFilteredImages(res.data.data);
// //       } else if (res?.data && Array.isArray(res.data)) {
// //         setImages(res.data);
// //         setFilteredImages(res.data);
// //       } else {
// //         console.error('Unexpected response structure:', res);
// //         toast.error('Received unexpected data format from server');
// //         setImages([]);
// //         setFilteredImages([]);
// //       }
// //     } catch (error) {
// //       console.error('Error occurred:', error);
// //       if (error.response?.status === 403) {
// //         toast.error('You do not have permission to view images');
// //       } else {
// //         toast.error(error.response?.data?.message || 'Error fetching images');
// //       }
// //       setImages([]);
// //       setFilteredImages([]);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const deleteRecord = async (id) => {
// //     if (!hasDeletePermission) {
// //       toast.error('You do not have permission to delete images');
// //       return;
// //     }

// //     if (!window.confirm('Are you sure you want to delete this image?')) {
// //       return;
// //     }

// //     try {
// //       const res = await AxiosInstance.delete(`/api/images/v1/images/?id=${id}`);
// //       if (res) {
// //         toast.success('Image deleted successfully!');
// //         fetchImages();
// //       }
// //     } catch (error) {
// //       console.error('Delete error:', error);
// //       if (error.response?.status === 403) {
// //         toast.error('You do not have permission to delete images');
// //       } else {
// //         toast.error(error.response?.data?.message || 'Error deleting image!');
// //       }
// //     }
// //   };

// //   const updateRecord = async (imgid) => {
// //     if (!hasUpdatePermission) {
// //       toast.error('You do not have permission to update images');
// //       return;
// //     }
// //     router.push(`/adminupdateimages?imgid=${imgid}`);
// //   };

// //   const handleSearch = (e) => {
// //     setSearchTerm(e.target.value);
// //   };

// //   const handleAddImage = () => {
// //     if (!hasCreatePermission) {
// //       toast.error('You do not have permission to add images');
// //       return;
// //     }
// //     router.push('/adminaddimages');
// //   };

// //   const handleLimitChange = (e) => {
// //     setItemsPerPage(parseInt(e.target.value));
// //     setCurrentPage(1);
// //   };

// //   // Pagination calculations
// //   const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
// //   const indexOfLastItem = currentPage * itemsPerPage;
// //   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
// //   const currentImages = filteredImages.slice(indexOfFirstItem, indexOfLastItem);

// //   const handlePageChange = (page) => {
// //     if (page >= 1 && page <= totalPages) {
// //       setCurrentPage(page);
// //     }
// //   };

// //   // Access denied screen
// //   if (!hasReadPermission) {
// //     return (
// //       <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
// //         <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center max-w-md">
// //           <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
// //             <Eye className="w-10 h-10 text-red-400" />
// //           </div>
// //           <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
// //           <p className="text-slate-400 mb-6">
// //             You don't have permission to view Images. Please contact your administrator.
// //           </p>
// //           <p className="text-xs text-slate-500 mb-6">
// //             Required permission: READ_IMAGE
// //           </p>
// //           <button 
// //             onClick={() => router.push('/')}
// //             className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
// //           >
// //             Return to Dashboard
// //           </button>
// //         </div>
// //         <ToastContainer 
// //           position="top-right" 
// //           autoClose={3000}
// //           theme="dark"
// //           className="mt-16"
// //         />
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 overflow-auto">
// //       <ToastContainer 
// //         position="top-right" 
// //         autoClose={3000}
// //         theme="dark"
// //         className="mt-16"
// //       />
      
// //       {/* Header Section */}
// //       <div className="mb-8">
// //         <div className="flex items-center justify-between mb-6">
// //           <div>
// //             <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
// //               Image Gallery
// //             </h1>
// //             <p className="text-slate-400 text-sm">Manage and organize your image collection</p>
// //           </div>

// //           <div className="flex items-center gap-3">
// //             {hasCreatePermission && (
// //               <button
// //                 className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
// //                 onClick={handleAddImage}
// //               >
// //                 <Plus className="w-5 h-5" />
// //                 Add Images
// //               </button>
// //             )}
// //             <button
// //               className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 text-white px-6 py-3 rounded-xl font-semibold border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 hover:scale-105"
// //               onClick={() => router.push('/ImagesCategoryPage')}
// //             >
// //               <Folder className="w-5 h-5" />
// //               Categories
// //             </button>
// //           </div>
// //         </div>

// //         {/* Stats Cards */}
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
// //           <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-all">
// //             <div className="flex items-center justify-between mb-2">
// //               <span className="text-slate-400 text-sm font-medium">Total Images</span>
// //               <ImageIcon className="w-5 h-5 text-blue-400" />
// //             </div>
// //             <p className="text-3xl font-bold text-white">{images.length}</p>
// //           </div>
          
// //           <div className="bg-gradient-to-br from-purple-900/20 to-purple-950/30 backdrop-blur-sm border border-purple-700/30 rounded-xl p-5 hover:border-purple-600/40 transition-all">
// //             <div className="flex items-center justify-between mb-2">
// //               <span className="text-slate-400 text-sm font-medium">Current Page</span>
// //               <Grid3x3 className="w-5 h-5 text-purple-400" />
// //             </div>
// //             <p className="text-3xl font-bold text-purple-400">{currentPage} / {totalPages || 1}</p>
// //           </div>

// //           <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-5 hover:border-emerald-600/40 transition-all">
// //             <div className="flex items-center justify-between mb-2">
// //               <span className="text-slate-400 text-sm font-medium">Showing</span>
// //               <Eye className="w-5 h-5 text-emerald-400" />
// //             </div>
// //             <p className="text-3xl font-bold text-emerald-400">{currentImages.length}</p>
// //           </div>
// //         </div>

// //         {/* Search and Filters */}
// //         <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
// //           <div className="flex flex-wrap gap-4 items-center">
// //             <div className="flex-1 min-w-[250px] relative">
// //               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
// //               <input
// //                 type="text"
// //                 placeholder="Search by name, category, or description..."
// //                 value={searchTerm}
// //                 onChange={handleSearch}
// //                 className="w-full pl-12 pr-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
// //               />
// //             </div>

// //             <div className="flex items-center gap-2">
// //               <Filter className="w-5 h-5 text-slate-400" />
// //               <select
// //                 value={itemsPerPage}
// //                 onChange={handleLimitChange}
// //                 className="px-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
// //               >
// //                 <option value="12">12 per page</option>
// //                 <option value="24">24 per page</option>
// //                 <option value="36">36 per page</option>
// //                 <option value="48">48 per page</option>
// //               </select>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Loading State */}
// //       {isLoading && (
// //         <div className="flex flex-col items-center justify-center py-20">
// //           <div className="relative">
// //             <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
// //             <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
// //           </div>
// //           <p className="mt-6 text-slate-400 font-medium">Loading images...</p>
// //         </div>
// //       )}

// //       {/* Images Grid */}
// //       {!isLoading && (
// //         <>
// //           {currentImages.length > 0 ? (
// //             <>
// //               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
// //                 {currentImages.map(item => (
// //                   <div
// //                     key={item.id}
// //                     className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1"
// //                   >
// //                     <div className="aspect-square relative overflow-hidden">
// //                       <Image
// //                         src={item.image}
// //                         alt={item.name}
// //                         width={400}
// //                         height={400}
// //                         className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700 ease-out"
// //                         onError={(e) => {
// //                           e.target.src = '/fallback-image.jpg';
// //                         }}
// //                       />
// //                       {/* Enhanced gradient overlay */}
// //                       <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                      
// //                       {/* Shine effect on hover */}
// //                       <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
// //                         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
// //                       </div>
// //                     </div>
                    
// //                     <div className="absolute inset-0 p-5 flex flex-col justify-between">
// //                       {/* Top section - Category badge */}
// //                       <div className="flex items-start justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
// //                         <span className="px-3 py-1.5 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20 shadow-lg">
// //                           {item.category_name || 'Uncategorized'}
// //                         </span>
// //                       </div>

// //                       {/* Bottom section - Title and Actions */}
// //                       <div className="space-y-3">
// //                         {/* Title with better visibility */}
// //                         <div className="bg-slate-900/80 backdrop-blur-md rounded-xl p-3 border border-slate-700/50">
// //                           <h3 className="text-white font-bold text-base line-clamp-2 leading-tight" title={item.name}>
// //                             {item.name}
// //                           </h3>
// //                           {item.description && (
// //                             <p className="text-slate-300 text-xs mt-1 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
// //                               {item.description}
// //                             </p>
// //                           )}
// //                         </div>
                        
// //                         {/* Action Buttons - Enhanced Design */}
// //                         {(hasUpdatePermission || hasDeletePermission) && (
// //                           <div className="flex gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
// //                             {hasUpdatePermission && (
// //                               <button
// //                                 onClick={(e) => { 
// //                                   e.stopPropagation(); 
// //                                   updateRecord(item.id); 
// //                                 }}
// //                                 className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/50"
// //                                 title="Edit Image"
// //                               >
// //                                 <Edit2 className="w-4 h-4" />
// //                                 <span className="text-xs">Edit</span>
// //                               </button>
// //                             )}
// //                             {hasDeletePermission && (
// //                               <button
// //                                 onClick={(e) => { 
// //                                   e.stopPropagation(); 
// //                                   deleteRecord(item.id); 
// //                                 }}
// //                                 className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all hover:scale-105 hover:shadow-red-500/50"
// //                                 title="Delete Image"
// //                               >
// //                                 <Trash2 className="w-4 h-4" />
// //                                 <span className="text-xs">Delete</span>
// //                               </button>
// //                             )}
// //                           </div>
// //                         )}
// //                       </div>
// //                     </div>

// //                     {/* Corner accent */}
// //                     <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
// //                       <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-blue-400/50 rounded-tr-lg"></div>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>

// //               {/* Pagination */}
// //               {totalPages > 1 && (
// //                 <div className="flex justify-center items-center gap-2 mt-8 pb-6">
// //                   <button
// //                     onClick={() => handlePageChange(currentPage - 1)}
// //                     disabled={currentPage === 1}
// //                     className={`px-4 py-2 rounded-lg font-medium transition-all ${
// //                       currentPage === 1
// //                         ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
// //                         : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
// //                     }`}
// //                   >
// //                     Previous
// //                   </button>

// //                   <div className="flex gap-2">
// //                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
// //                       let pageNum;
// //                       if (totalPages <= 5) {
// //                         pageNum = i + 1;
// //                       } else if (currentPage <= 3) {
// //                         pageNum = i + 1;
// //                       } else if (currentPage >= totalPages - 2) {
// //                         pageNum = totalPages - 4 + i;
// //                       } else {
// //                         pageNum = currentPage - 2 + i;
// //                       }

// //                       return (
// //                         <button
// //                           key={pageNum}
// //                           onClick={() => handlePageChange(pageNum)}
// //                           className={`w-10 h-10 rounded-lg font-medium transition-all ${
// //                             currentPage === pageNum 
// //                               ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
// //                               : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
// //                           }`}
// //                         >
// //                           {pageNum}
// //                         </button>
// //                       );
// //                     })}
// //                   </div>

// //                   <button
// //                     onClick={() => handlePageChange(currentPage + 1)}
// //                     disabled={currentPage === totalPages}
// //                     className={`px-4 py-2 rounded-lg font-medium transition-all ${
// //                       currentPage === totalPages
// //                         ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
// //                         : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
// //                     }`}
// //                   >
// //                     Next
// //                   </button>
// //                 </div>
// //               )}
// //             </>
// //           ) : (
// //             <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
// //               <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
// //                 <ImageIcon className="w-10 h-10 text-slate-600" />
// //               </div>
// //               <h3 className="text-xl font-semibold text-white mb-2">
// //                 {searchTerm ? 'No images found matching your search' : 'No images found'}
// //               </h3>
// //               <p className="text-slate-400 mb-6">
// //                 {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first image'}
// //               </p>
// //               {hasCreatePermission && !searchTerm && (
// //                 <button
// //                   className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
// //                   onClick={handleAddImage}
// //                 >
// //                   <Plus className="w-5 h-5" />
// //                   Add Your First Image
// //                 </button>
// //               )}
// //             </div>
// //           )}
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default ImagesCom;





// 'use client';
// import React, { useEffect, useState, useContext } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import AxiosInstance from "@/components/AxiosInstance";
// import { useRouter } from 'next/navigation';
// import { AuthContext } from '@/components/AuthContext';
// import Image from 'next/image';
// import { Search, Plus, Filter, Edit2, Trash2, ImageIcon, Folder, Grid3x3, Eye } from 'lucide-react';

// const ImagesCom = () => {
//   const router = useRouter();
//   const { permissions = {} } = useContext(AuthContext);
//   const [images, setImages] = useState([]);
//   const [filteredImages, setFilteredImages] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(12);

//   // Check for permissions
//   const hasReadPermission = permissions.read_image || permissions.READ_IMAGE;
//   const hasCreatePermission = permissions.create_image || permissions.CREATE_IMAGE;
//   const hasUpdatePermission = permissions.update_image || permissions.UPDATE_IMAGE;
//   const hasDeletePermission = permissions.delete_image || permissions.DELETE_IMAGE;

//   useEffect(() => {
//     if (hasReadPermission) {
//       fetchImages();
//     }
//   }, [hasReadPermission]);

//   // Update filtered images when search term or images change
//   useEffect(() => {
//     if (searchTerm) {
//       const filtered = images.filter(item => 
//         item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         item.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         item.description?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       setFilteredImages(filtered);
//     } else {
//       setFilteredImages(images);
//     }
//     setCurrentPage(1); // Reset to first page when filtering
//   }, [searchTerm, images]);

//   const fetchImages = async () => {
//     if (!hasReadPermission) {
//       toast.error('You do not have permission to view images');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const res = await AxiosInstance.get('/api/images/v1/images/');
      
//       // Handle the response structure from your API
//       if (res?.data?.data && Array.isArray(res.data.data)) {
//         setImages(res.data.data);
//         setFilteredImages(res.data.data);
//       } else if (res?.data && Array.isArray(res.data)) {
//         setImages(res.data);
//         setFilteredImages(res.data);
//       } else {
//         console.error('Unexpected response structure:', res);
//         toast.error('Received unexpected data format from server');
//         setImages([]);
//         setFilteredImages([]);
//       }
//     } catch (error) {
//       console.error('Error occurred:', error);
//       if (error.response?.status === 403) {
//         toast.error('You do not have permission to view images');
//       } else {
//         toast.error(error.response?.data?.message || 'Error fetching images');
//       }
//       setImages([]);
//       setFilteredImages([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const deleteRecord = async (id) => {
//     if (!hasDeletePermission) {
//       toast.error('You do not have permission to delete images');
//       return;
//     }

//     if (!window.confirm('Are you sure you want to delete this image?')) {
//       return;
//     }

//     try {
//       const res = await AxiosInstance.delete(`/api/images/v1/images/?id=${id}`);
//       if (res) {
//         toast.success('Image deleted successfully!');
//         fetchImages();
//       }
//     } catch (error) {
//       console.error('Delete error:', error);
//       if (error.response?.status === 403) {
//         toast.error('You do not have permission to delete images');
//       } else {
//         toast.error(error.response?.data?.message || 'Error deleting image!');
//       }
//     }
//   };

//   const updateRecord = async (imgid) => {
//     if (!hasUpdatePermission) {
//       toast.error('You do not have permission to update images');
//       return;
//     }
//     router.push(`/updateimagespage?imgid=${imgid}`);
//   };

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleAddImage = () => {
//     if (!hasCreatePermission) {
//       toast.error('You do not have permission to add images');
//       return;
//     }
//     router.push('/addimagespage');
//   };

//   const handleLimitChange = (e) => {
//     setItemsPerPage(parseInt(e.target.value));
//     setCurrentPage(1);
//   };

//   // Pagination calculations
//   const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentImages = filteredImages.slice(indexOfFirstItem, indexOfLastItem);

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   // Access denied screen
//   if (!hasReadPermission) {
//     return (
//       <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
//         <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center max-w-md">
//           <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
//             <Eye className="w-10 h-10 text-red-400" />
//           </div>
//           <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
//           <p className="text-slate-400 mb-6">
//             You don't have permission to view Images. Please contact your administrator.
//           </p>
//           <p className="text-xs text-slate-500 mb-6">
//             Required permission: READ_IMAGE
//           </p>
//           <button 
//             onClick={() => router.push('/')}
//             className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
//           >
//             Return to Dashboard
//           </button>
//         </div>
//         <ToastContainer 
//           position="top-right" 
//           autoClose={3000}
//           theme="dark"
//           className="mt-16"
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 overflow-auto">
//       <ToastContainer 
//         position="top-right" 
//         autoClose={3000}
//         theme="dark"
//         className="mt-16"
//       />
      
//       {/* Header Section */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
//               Image Gallery
//             </h1>
//             <p className="text-slate-400 text-sm">Manage and organize your image collection</p>
//           </div>

//           <div className="flex items-center gap-3">
//             {hasCreatePermission && (
//               <button
//                 className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
//                 onClick={handleAddImage}
//               >
//                 <Plus className="w-5 h-5" />
//                 Add Images
//               </button>
//             )}
//             <button
//               className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 text-white px-6 py-3 rounded-xl font-semibold border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 hover:scale-105"
//               onClick={() => router.push('/ImagesCategoryPage')}
//             >
//               <Folder className="w-5 h-5" />
//               Categories
//             </button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-all">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-slate-400 text-sm font-medium">Total Images</span>
//               <ImageIcon className="w-5 h-5 text-blue-400" />
//             </div>
//             <p className="text-3xl font-bold text-white">{images.length}</p>
//           </div>
          
//           <div className="bg-gradient-to-br from-purple-900/20 to-purple-950/30 backdrop-blur-sm border border-purple-700/30 rounded-xl p-5 hover:border-purple-600/40 transition-all">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-slate-400 text-sm font-medium">Current Page</span>
//               <Grid3x3 className="w-5 h-5 text-purple-400" />
//             </div>
//             <p className="text-3xl font-bold text-purple-400">{currentPage} / {totalPages || 1}</p>
//           </div>

//           <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-5 hover:border-emerald-600/40 transition-all">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-slate-400 text-sm font-medium">Showing</span>
//               <Eye className="w-5 h-5 text-emerald-400" />
//             </div>
//             <p className="text-3xl font-bold text-emerald-400">{currentImages.length}</p>
//           </div>
//         </div>

//         {/* Search and Filters */}
//         <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
//           <div className="flex flex-wrap gap-4 items-center">
//             <div className="flex-1 min-w-[250px] relative">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//               <input
//                 type="text"
//                 placeholder="Search by name, category, or description..."
//                 value={searchTerm}
//                 onChange={handleSearch}
//                 className="w-full pl-12 pr-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
//               />
//             </div>

//             <div className="flex items-center gap-2">
//               <Filter className="w-5 h-5 text-slate-400" />
//               <select
//                 value={itemsPerPage}
//                 onChange={handleLimitChange}
//                 className="px-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
//               >
//                 <option value="12">12 per page</option>
//                 <option value="24">24 per page</option>
//                 <option value="36">36 per page</option>
//                 <option value="48">48 per page</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Loading State */}
//       {isLoading && (
//         <div className="flex flex-col items-center justify-center py-20">
//           <div className="relative">
//             <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
//             <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
//           </div>
//           <p className="mt-6 text-slate-400 font-medium">Loading images...</p>
//         </div>
//       )}

//       {/* Images Grid - LUXURY DESIGN */}
//       {!isLoading && (
//         <>
//           {currentImages.length > 0 ? (
//             <>
//               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
//                 {currentImages.map(item => (
//                   <div
//                     key={item.id}
//                     className="group relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-2 border-slate-700/30 rounded-3xl overflow-hidden hover:border-amber-500/60 transition-all duration-700 hover:shadow-[0_20px_60px_-15px_rgba(251,191,36,0.3)] hover:-translate-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
//                   >
//                     {/* Luxury border frame */}
//                     <div className="absolute inset-0 rounded-3xl pointer-events-none">
//                       <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-400/40 rounded-tl-3xl"></div>
//                       <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-400/40 rounded-tr-3xl"></div>
//                       <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-400/40 rounded-bl-3xl"></div>
//                       <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-400/40 rounded-br-3xl"></div>
//                     </div>

//                     <div className="aspect-square relative overflow-hidden m-2 rounded-2xl">
//                       <Image
//                         src={item.image}
//                         alt={item.name}
//                         width={400}
//                         height={400}
//                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
//                         onError={(e) => {
//                           e.target.src = '/fallback-image.jpg';
//                         }}
//                       />
//                       {/* Luxury gradient overlay */}
//                       <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                      
//                       {/* Gold shimmer effect */}
//                       <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
//                         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
//                       </div>

//                       {/* Vignette effect */}
//                       <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)]"></div>
//                     </div>
                    
//                     <div className="absolute inset-0 p-5 flex flex-col justify-between">
//                       {/* Top section - Category badge */}
//                       <div className="flex items-start justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-2 group-hover:translate-y-0">
//                         <span className="px-4 py-2 bg-gradient-to-r from-amber-600/90 via-amber-500/90 to-yellow-600/90 backdrop-blur-xl text-white text-xs font-bold rounded-full border-2 border-amber-400/30 shadow-[0_4px_20px_rgba(251,191,36,0.4)] uppercase tracking-wider">
//                           {item.category_name || 'Uncategorized'}
//                         </span>
//                       </div>

//                       {/* Bottom section - Title and Actions */}
//                       <div className="space-y-3">
//                         {/* Title with better visibility */}
//                         <div className="backdrop-blur-md rounded-2xl p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent border-b-2 border-amber-500/30">
//                           <h3 className="text-white font-bold text-base line-clamp-2 leading-tight mb-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" title={item.name}>
//                             {item.name}
//                           </h3>
//                           {item.description && (
//                             <p className="text-amber-200/90 text-xs mt-2 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
//                               {item.description}
//                             </p>
//                           )}
//                         </div>
                        
//                         {/* Action Buttons - Luxury Design */}
//                         {(hasUpdatePermission || hasDeletePermission) && (
//                           <div className="flex gap-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
//                             {hasUpdatePermission && (
//                               <button
//                                 onClick={(e) => { 
//                                   e.stopPropagation(); 
//                                   updateRecord(item.id); 
//                                 }}
//                                 className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:via-amber-400 hover:to-yellow-500 text-slate-900 font-bold rounded-xl shadow-[0_4px_20px_rgba(251,191,36,0.4)] hover:shadow-[0_6px_30px_rgba(251,191,36,0.6)] transition-all hover:scale-105 border-2 border-amber-400/30"
//                                 title="Edit Image"
//                               >
//                                 <Edit2 className="w-4 h-4" />
//                                 <span className="text-xs uppercase tracking-wide">Edit</span>
//                               </button>
//                             )}
//                             {hasDeletePermission && (
//                               <button
//                                 onClick={(e) => { 
//                                   e.stopPropagation(); 
//                                   deleteRecord(item.id); 
//                                 }}
//                                 className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-red-600 hover:to-red-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_30px_rgba(239,68,68,0.4)] transition-all hover:scale-105 border-2 border-slate-500/30 hover:border-red-500/50"
//                                 title="Delete Image"
//                               >
//                                 <Trash2 className="w-4 h-4" />
//                                 <span className="text-xs uppercase tracking-wide">Delete</span>
//                               </button>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="flex justify-center items-center gap-2 mt-8 pb-6">
//                   <button
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={currentPage === 1}
//                     className={`px-4 py-2 rounded-lg font-medium transition-all ${
//                       currentPage === 1
//                         ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
//                         : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
//                     }`}
//                   >
//                     Previous
//                   </button>

//                   <div className="flex gap-2">
//                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                       let pageNum;
//                       if (totalPages <= 5) {
//                         pageNum = i + 1;
//                       } else if (currentPage <= 3) {
//                         pageNum = i + 1;
//                       } else if (currentPage >= totalPages - 2) {
//                         pageNum = totalPages - 4 + i;
//                       } else {
//                         pageNum = currentPage - 2 + i;
//                       }

//                       return (
//                         <button
//                           key={pageNum}
//                           onClick={() => handlePageChange(pageNum)}
//                           className={`w-10 h-10 rounded-lg font-medium transition-all ${
//                             currentPage === pageNum 
//                               ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
//                               : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
//                           }`}
//                         >
//                           {pageNum}
//                         </button>
//                       );
//                     })}
//                   </div>

//                   <button
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                     className={`px-4 py-2 rounded-lg font-medium transition-all ${
//                       currentPage === totalPages
//                         ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
//                         : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
//               <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <ImageIcon className="w-10 h-10 text-slate-600" />
//               </div>
//               <h3 className="text-xl font-semibold text-white mb-2">
//                 {searchTerm ? 'No images found matching your search' : 'No images found'}
//               </h3>
//               <p className="text-slate-400 mb-6">
//                 {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first image'}
//               </p>
//               {hasCreatePermission && !searchTerm && (
//                 <button
//                   className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
//                   onClick={handleAddImage}
//                 >
//                   <Plus className="w-5 h-5" />
//                   Add Your First Image
//                 </button>
//               )}
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default ImagesCom;





'use client';
import React, { useEffect, useState, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';
import { Search, Plus, Filter, Edit2, Trash2, ImageIcon, Folder, Grid3x3, Eye } from 'lucide-react';

const ImagesCom = () => {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  
  const permissions = authContext?.permissions || {};
  
  const [data, setData] = useState({
    images: [],
    count: 0,
    skip: 0,
    limit: 12,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Check for permissions
  const hasReadPermission = permissions?.read_image || permissions?.READ_IMAGE || false;
  const hasCreatePermission = permissions?.create_image || permissions?.CREATE_IMAGE || false;
  const hasUpdatePermission = permissions?.update_image || permissions?.UPDATE_IMAGE || false;
  const hasDeletePermission = permissions?.delete_image || permissions?.DELETE_IMAGE || false;

  useEffect(() => {
    if (hasReadPermission) {
      fetchImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasReadPermission, data.skip, data.limit]);

  const fetchImages = async () => {
    if (!hasReadPermission) {
      toast.error('You do not have permission to view images');
      return;
    }

    setIsLoading(true);
    
    try {
      // Backend endpoint: GET /api/images/v1/image/?skip=0&limit=12
      const url = `/api/images/v1/image/?skip=${data.skip}&limit=${data.limit}`;
      console.log('Fetching images from:', url);
      
      const res = await AxiosInstance.get(url);
      
      console.log('=== FULL RESPONSE ===');
      console.log('res.data:', res.data);
      
      // Backend returns: { status: "success", result: { count: X, data: [...] } }
      let images = [];
      let count = 0;
      
      if (res.data && res.data.result) {
        if (res.data.result.data && Array.isArray(res.data.result.data)) {
          images = res.data.result.data;
          count = res.data.result.count || res.data.result.data.length;
          console.log('✅ Found data in res.data.result.data');
        }
      }
      
      console.log('Final images to set:', images);
      console.log('Final count to set:', count);
      
      setData(prev => ({
        ...prev,
        images: images,
        count: count
      }));
      
      if (images.length > 0) {
        toast.success(`Loaded ${images.length} images`);
      } else {
        toast.info('No images found');
      }
      
    } catch (error) {
      console.error('=== ERROR DETAILS ===');
      console.error('Error:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 403) {
        toast.error('You do not have permission to view images');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
      } else {
        toast.error('Error fetching images: ' + (error.response?.data?.detail || error.message));
      }
      setData(prev => ({ ...prev, images: [], count: 0 }));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!hasDeletePermission) {
      toast.error('You do not have permission to delete images');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      // Backend endpoint: DELETE /api/images/v1/image/{image_id}
      const res = await AxiosInstance.delete(`/api/images/v1/image/${id}`);
      
      // Backend returns: { "message": "Image soft deleted successfully" }
      if (res.data && res.data.message) {
        toast.success(res.data.message || 'Image deleted successfully!');
        fetchImages();
      }
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to delete images');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
      } else if (error.response?.status === 404) {
        toast.error('Image not found');
      } else {
        toast.error(error.response?.data?.detail || 'Error deleting image!');
      }
    }
  };

  const updateRecord = (imgid) => {
    if (!hasUpdatePermission) {
      toast.error('You do not have permission to update images');
      return;
    }
    router.push(`/adminupdateimages?imgid=${imgid}`);
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!hasReadPermission) {
      return;
    }

    if (!value.trim()) {
      fetchImages();
      return;
    }

    try {
      // Search by name
      const res = await AxiosInstance.get(`/api/images/v1/image/?skip=0&limit=100&name=${value}`);
      
      let images = [];
      let count = 0;
      
      if (res.data && res.data.result) {
        if (res.data.result.data && Array.isArray(res.data.result.data)) {
          images = res.data.result.data;
          count = res.data.result.count || res.data.result.data.length;
        }
      }
      
      setData(prev => ({
        ...prev,
        images: images,
        count: count,
        skip: 0
      }));
      setCurrentPage(1);
    } catch (error) {
      console.error('Search error:', error);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to search images');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
      } else {
        toast.error('Error searching images');
      }
    }
  };

  const handleAddImage = () => {
    if (!hasCreatePermission) {
      toast.error('You do not have permission to add images');
      return;
    }
    router.push('/adminaddimages');
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setData(prev => ({
      ...prev,
      limit: newLimit,
      skip: 0
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    const newSkip = (page - 1) * data.limit;
    setData(prev => ({
      ...prev,
      skip: newSkip
    }));
    setCurrentPage(page);
  };

  // Calculate total pages
  const totalPages = Math.ceil(data.count / data.limit);

  // Check if AuthContext is still loading
  if (!authContext) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="mt-6 text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Access denied screen
  if (!hasReadPermission) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-slate-400 mb-6">
            You don't have permission to view Images. Please contact your administrator.
          </p>
          <p className="text-xs text-slate-500 mb-6">
            Required permission: read_image
          </p>
          <button 
            onClick={() => router.push('/admindashboard')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
          >
            Return to Dashboard
          </button>
        </div>
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          theme="dark"
          className="mt-16"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 overflow-auto">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="dark"
        className="mt-16"
      />
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Image Gallery
            </h1>
            <p className="text-slate-400 text-sm">Manage and organize your image collection</p>
          </div>

          <div className="flex items-center gap-3">
            {hasCreatePermission && (
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
                onClick={handleAddImage}
              >
                <Plus className="w-5 h-5" />
                Add Image
              </button>
            )}
            <button
              className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 text-white px-6 py-3 rounded-xl font-semibold border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 hover:scale-105"
              onClick={() => router.push('/ImagesCategoryPage')}
            >
              <Folder className="w-5 h-5" />
              Categories
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Images</span>
              <ImageIcon className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{data.count}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/20 to-purple-950/30 backdrop-blur-sm border border-purple-700/30 rounded-xl p-5 hover:border-purple-600/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Current Page</span>
              <Grid3x3 className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">{currentPage} / {totalPages || 1}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-5 hover:border-emerald-600/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Per Page</span>
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-400">{data.limit}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={data.limit}
                onChange={handleLimitChange}
                className="px-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
              >
                <option value="12">12 per page</option>
                <option value="24">24 per page</option>
                <option value="36">36 per page</option>
                <option value="48">48 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="mt-6 text-slate-400 font-medium">Loading images...</p>
        </div>
      )}

      {/* Images Grid - LUXURY DESIGN */}
      {!isLoading && (
        <>
          {data.images.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.images.map(item => (
                  <div
                    key={item.id}
                    className="group relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-2 border-slate-700/30 rounded-3xl overflow-hidden hover:border-amber-500/60 transition-all duration-700 hover:shadow-[0_20px_60px_-15px_rgba(251,191,36,0.3)] hover:-translate-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
                  >
                    {/* Luxury border frame */}
                    <div className="absolute inset-0 rounded-3xl pointer-events-none">
                      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-400/40 rounded-tl-3xl"></div>
                      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-400/40 rounded-tr-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-400/40 rounded-bl-3xl"></div>
                      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-400/40 rounded-br-3xl"></div>
                    </div>

                    <div className="aspect-square relative overflow-hidden m-2 rounded-2xl">
                      {/* Use regular img tag for backend-served images */}
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${item.image_path}`}
                        alt={item.name || 'Image'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23334155"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23CBD5E1"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      {/* Luxury gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                      
                      {/* Gold shimmer effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
                      </div>

                      {/* Vignette effect */}
                      <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)]"></div>
                    </div>
                    
                    <div className="absolute inset-0 p-5 flex flex-col justify-between">
                      {/* Top section - Category badge */}
                      <div className="flex items-start justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-2 group-hover:translate-y-0">
                        {item.category && (
                          <span className="px-4 py-2 bg-gradient-to-r from-amber-600/90 via-amber-500/90 to-yellow-600/90 backdrop-blur-xl text-white text-xs font-bold rounded-full border-2 border-amber-400/30 shadow-[0_4px_20px_rgba(251,191,36,0.4)] uppercase tracking-wider">
                            {item.category.category || 'Uncategorized'}
                          </span>
                        )}
                      </div>

                      {/* Bottom section - Title and Actions */}
                      <div className="space-y-3">
                        {/* Title with better visibility */}
                        <div className="backdrop-blur-md rounded-2xl p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent border-b-2 border-amber-500/30">
                          <h3 className="text-white font-bold text-base line-clamp-2 leading-tight mb-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" title={item.name}>
                            {item.name || 'Untitled'}
                          </h3>
                          {item.description && (
                            <p className="text-amber-200/90 text-xs mt-2 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                              {item.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Action Buttons - Luxury Design */}
                        {(hasUpdatePermission || hasDeletePermission) && (
                          <div className="flex gap-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                            {hasUpdatePermission && (
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  updateRecord(item.id); 
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:via-amber-400 hover:to-yellow-500 text-slate-900 font-bold rounded-xl shadow-[0_4px_20px_rgba(251,191,36,0.4)] hover:shadow-[0_6px_30px_rgba(251,191,36,0.6)] transition-all hover:scale-105 border-2 border-amber-400/30"
                                title="Edit Image"
                              >
                                <Edit2 className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-wide">Edit</span>
                              </button>
                            )}
                            {hasDeletePermission && (
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  deleteRecord(item.id); 
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-red-600 hover:to-red-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_30px_rgba(239,68,68,0.4)] transition-all hover:scale-105 border-2 border-slate-500/30 hover:border-red-500/50"
                                title="Delete Image"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-wide">Delete</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 pb-6">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === 1
                        ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                        : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    First
                  </button>

                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === 1
                        ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                        : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    Prev
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === pageNum 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === totalPages
                        ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                        : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    Next
                  </button>

                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === totalPages
                        ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                        : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    Last
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm ? 'No images found matching your search' : 'No images found'}
              </h3>
              <p className="text-slate-400 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first image'}
              </p>
              {hasCreatePermission && !searchTerm && (
                <button
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
                  onClick={handleAddImage}
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Image
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImagesCom;