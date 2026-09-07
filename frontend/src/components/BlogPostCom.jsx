// 'use client';
// import React, { useEffect, useState, useContext } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import AxiosInstance from "@/components/AxiosInstance";
// import { useRouter } from 'next/navigation';
// import { AuthContext } from '@/components/AuthContext';

// // Icons (same as before)
// const Search = ({ className }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//   </svg>
// );

// const Plus = ({ className }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//   </svg>
// );

// const Filter = ({ className }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
//   </svg>
// );

// const Eye = ({ className }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//   </svg>
// );

// const Edit2 = ({ className }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//   </svg>
// );

// const Trash2 = ({ className }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//   </svg>
// );

// const Calendar = ({ className }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//   </svg>
// );

// const User = ({ className }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//   </svg>
// );

// const Folder = ({ className }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
//   </svg>
// );

// const TrendingUp = ({ className }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//   </svg>
// );

// const Tag = ({ className }) => (
//   <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
//   </svg>
// );

// const BlogPostCom = () => {
//   const router = useRouter();
//   const { permissions = {} } = useContext(AuthContext);
//   const [blogPosts, setBlogPosts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [statusFilter, setStatusFilter] = useState('');
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalCount, setTotalCount] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const recordsPerPage = 12;

//   // Permission checks based on your backend permissions
//   const hasReadPermission = permissions.read_blog_post || permissions.READ_BLOG_POST;
//   const hasCreatePermission = permissions.create_blog_post || permissions.CREATE_BLOG_POST;
//   const hasUpdatePermission = permissions.update_blog_post || permissions.UPDATE_BLOG_POST;
//   const hasDeletePermission = permissions.delete_blog_post || permissions.DELETE_BLOG_POST;

//   useEffect(() => {
//     if (hasReadPermission) {
//       fetchBlogPosts();
//     }
//   }, [currentPage, statusFilter, hasReadPermission]);

//   const fetchBlogPosts = async () => {
//     if (!hasReadPermission) {
//       toast.error('You do not have permission to view blog posts');
//       return;
//     }

//     setLoading(true);
    
//     try {
//       const params = {
//         page: currentPage,
//         limit: recordsPerPage,
//       };
      
//       if (statusFilter) {
//         params.status = statusFilter;
//       }

//       const res = await AxiosInstance.get('/api/myapp/v1/blog/post/', { params });

//       // Handle the exact response structure from your backend
//       if (res?.data?.data && Array.isArray(res.data.data)) {
//         setBlogPosts(res.data.data);
//         setTotalCount(res.data.count || res.data.data.length);
//         setTotalPages(Math.ceil((res.data.count || res.data.data.length) / recordsPerPage));
//       } else {
//         console.error('Unexpected response structure:', res);
//         toast.error('Received unexpected data format from server');
//         setBlogPosts([]);
//         setTotalPages(1);
//         setTotalCount(0);
//       }
      
//     } catch (error) {
//       console.error('Error fetching blog posts:', error);
//       if (error.response?.status === 403) {
//         toast.error('You do not have permission to view blog posts');
//       } else if (error.response?.status === 401) {
//         toast.error('Please login to access blog posts');
//       } else {
//         toast.error(error.response?.data?.message || 'Error fetching blog posts');
//       }
//       setBlogPosts([]);
//       setTotalPages(1);
//       setTotalCount(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteBlogPost = async (id) => {
//     if (!hasDeletePermission) {
//       toast.error('You do not have permission to delete blog posts');
//       return;
//     }

//     if (!window.confirm('Are you sure you want to delete this blog post?')) {
//       return;
//     }

//     try {
//       const res = await AxiosInstance.delete(`/api/myapp/v1/blog/post/?id=${id}`);
//       if (res) {
//         toast.success('Blog post deleted successfully!');
//         fetchBlogPosts();
//       }
//     } catch (error) {
//       console.error('Delete error:', error);
//       if (error.response?.status === 403) {
//         toast.error('You do not have permission to delete blog posts');
//       } else if (error.response?.status === 404) {
//         toast.error('Blog post not found');
//       } else {
//         toast.error(error.response?.data?.message || 'Error deleting blog post');
//       }
//     }
//   };

//   const updateBlogPost = (item) => {
//     if (!hasUpdatePermission) {
//       toast.error('You do not have permission to update blog posts');
//       return;
//     }
//     router.push(`/updateblogpostpage?id=${item.id}`);
//   };

//   const viewBlogPost = (item) => {
//     router.push(`/blogdetailpage?id=${item.id}`);
//   };

//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);
//   };

//   const handleAddBlogPost = () => {
//     if (!hasCreatePermission) {
//       toast.error('You do not have permission to create blog posts');
//       return;
//     }
//     router.push('/addblogpostpage');
//   };

//   const filteredBlogPosts = Array.isArray(blogPosts) ? blogPosts.filter((post) => {
//     if (!post) return false;
//     const titleMatch = post.title?.toLowerCase().includes(searchTerm);
//     const authorMatch = post.author?.toLowerCase().includes(searchTerm);
//     const createdByMatch = post.created_by?.toLowerCase().includes(searchTerm);
//     const contentMatch = post.content?.toLowerCase().includes(searchTerm);
//     const categoryMatch = post.category?.name?.toLowerCase().includes(searchTerm);
//     const idMatch = post.id?.toString() === searchTerm;
    
//     return titleMatch || authorMatch || createdByMatch || contentMatch || categoryMatch || idMatch;
//   }) : [];

//   const getStatusBadgeColor = (status) => {
//     switch (status) {
//       case 'published':
//         return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
//       case 'draft':
//         return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
//       case 'archived':
//         return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
//       case 'scheduled':
//         return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
//       default:
//         return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       const date = new Date(dateString.replace(' ', 'T'));
//       return date.toLocaleDateString('en-US', { 
//         year: 'numeric', 
//         month: 'short', 
//         day: 'numeric' 
//       });
//     } catch (e) {
//       return 'N/A';
//     }
//   };

//   // Calculate stats based on actual data
//   const publishedCount = blogPosts.filter(p => p?.status === 'published').length;
//   const draftCount = blogPosts.filter(p => p?.status === 'draft').length;
//   const uniqueCategoriesCount = new Set(blogPosts.map(p => p.category?.id).filter(Boolean)).size;

//   if (!hasReadPermission) {
//     return (
//       <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
//         <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center max-w-md">
//           <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
//             <Eye className="w-10 h-10 text-red-400" />
//           </div>
//           <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
//           <p className="text-slate-400 mb-6">
//             You don't have permission to view Blog Posts. Please contact your administrator.
//           </p>
//           <p className="text-xs text-slate-500 mb-6">
//             Required permission: READ_BLOG_POST
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
//     <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
//       <ToastContainer 
//         position="top-right" 
//         autoClose={3000}
//         theme="dark"
//         className="mt-16"
//       />
      
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
//                 Blog Management
//               </h1>
//               <p className="text-slate-400 text-sm">Manage and organize your blog content</p>
//             </div>

//             {hasCreatePermission && (
//               <button
//                 className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
//                 onClick={handleAddBlogPost}
//               >
//                 <Plus className="w-5 h-5" />
//                 Create Post
//               </button>
//             )}
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//             <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-all">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-slate-400 text-sm font-medium">Total Posts</span>
//                 <TrendingUp className="w-5 h-5 text-blue-400" />
//               </div>
//               <p className="text-3xl font-bold text-white">{totalCount}</p>
//             </div>
            
//             <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-5 hover:border-emerald-600/40 transition-all">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-slate-400 text-sm font-medium">Published</span>
//                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
//               </div>
//               <p className="text-3xl font-bold text-emerald-400">{publishedCount}</p>
//             </div>

//             <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/30 backdrop-blur-sm border border-amber-700/30 rounded-xl p-5 hover:border-amber-600/40 transition-all">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-slate-400 text-sm font-medium">Drafts</span>
//                 <Edit2 className="w-5 h-5 text-amber-400" />
//               </div>
//               <p className="text-3xl font-bold text-amber-400">{draftCount}</p>
//             </div>

//             <div className="bg-gradient-to-br from-purple-900/20 to-purple-950/30 backdrop-blur-sm border border-purple-700/30 rounded-xl p-5 hover:border-purple-600/40 transition-all">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-slate-400 text-sm font-medium">Categories</span>
//                 <Folder className="w-5 h-5 text-purple-400" />
//               </div>
//               <p className="text-3xl font-bold text-purple-400">{uniqueCategoriesCount}</p>
//             </div>
//           </div>

//           {/* Search and Filters */}
//           <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
//             <div className="flex flex-wrap gap-4 items-center">
//               <div className="flex-1 min-w-[250px] relative">
//                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                 <input
//                   type="text"
//                   placeholder="Search by title, author, content, category, or ID..."
//                   value={searchTerm}
//                   onChange={handleSearch}
//                   className="w-full pl-12 pr-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
//                 />
//               </div>

//               <div className="flex items-center gap-2">
//                 <Filter className="w-5 h-5 text-slate-400" />
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => {
//                     setStatusFilter(e.target.value);
//                     setCurrentPage(1);
//                   }}
//                   className="px-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
//                 >
//                   <option value="">All Status</option>
//                   <option value="published">Published</option>
//                   <option value="draft">Draft</option>
//                   <option value="archived">Archived</option>
//                   <option value="scheduled">Scheduled</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Loading State */}
//         {loading && (
//           <div className="flex flex-col items-center justify-center py-20">
//             <div className="relative">
//               <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
//               <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
//             </div>
//             <p className="mt-6 text-slate-400 font-medium">Loading blog posts...</p>
//           </div>
//         )}

//         {/* Blog Posts List */}
//         {!loading && (
//           <div className="space-y-4">
//             {filteredBlogPosts.length > 0 ? (
//               <>
//                 {filteredBlogPosts.map((post) => (
//                   <div
//                     key={post.id}
//                     className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/60 transition-all duration-300"
//                   >
//                     <div className="p-6">
//                       <div className="flex items-start justify-between gap-4">
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-3 mb-3">
//                             <span className="px-3 py-1 bg-slate-700/50 text-slate-400 text-xs font-mono rounded-md border border-slate-600/30">
//                               #{post.id}
//                             </span>
//                             <h3 className="text-xl font-bold text-white truncate flex-1">
//                               {post.title}
//                             </h3>
//                             {post.is_featured && (
//                               <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-md border border-yellow-500/30">
//                                 Featured
//                               </span>
//                             )}
//                           </div>

//                           {post.subtitle && (
//                             <p className="text-slate-400 text-sm mb-4 line-clamp-2">
//                               {post.subtitle}
//                             </p>
//                           )}

//                           <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
//                             <div className="flex items-center gap-2 text-slate-400">
//                               <User className="w-4 h-4" />
//                               <span>{post.created_by || post.author || 'Unknown'}</span>
//                             </div>

//                             {post.category && (
//                               <div className="flex items-center gap-2 text-slate-400">
//                                 <Folder className="w-4 h-4" />
//                                 <span>{post.category.name}</span>
//                               </div>
//                             )}

//                             <div className="flex items-center gap-2 text-slate-400">
//                               <Calendar className="w-4 h-4" />
//                               <span>{formatDate(post.published_at || post.created_at)}</span>
//                             </div>

//                             <div className="flex items-center gap-2 text-slate-400">
//                               <Eye className="w-4 h-4" />
//                               <span>{post.view_count || 0} views</span>
//                             </div>

//                             <div className="flex items-center gap-2 text-slate-400">
//                               <span>{post.reading_time || 0} min read</span>
//                             </div>

//                             <div className="flex items-center gap-2 text-slate-400">
//                               <span>{post.comments_count || 0} comments</span>
//                             </div>

//                             <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(post.status)}`}>
//                               {post.status?.charAt(0).toUpperCase() + post.status?.slice(1)}
//                             </span>
//                           </div>

//                           {post.tags_list && Array.isArray(post.tags_list) && post.tags_list.length > 0 && (
//                             <div className="flex items-center gap-2 flex-wrap">
//                               <Tag className="w-4 h-4 text-slate-500" />
//                               {post.tags_list.map((tag) => (
//                                 <span
//                                   key={tag.id}
//                                   className="px-2 py-1 text-xs rounded-md border"
//                                   style={{
//                                     backgroundColor: `${tag.color}20`,
//                                     borderColor: `${tag.color}40`,
//                                     color: tag.color
//                                   }}
//                                 >
//                                   {tag.name}
//                                 </span>
//                               ))}
//                             </div>
//                           )}
//                         </div>

//                         <div className="flex items-center gap-2">
//                           <button
//                             className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-all"
//                             onClick={() => viewBlogPost(post)}
//                             title="View Post"
//                           >
//                             <Eye className="w-5 h-5" />
//                           </button>

//                           {hasUpdatePermission && (
//                             <button
//                               className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg transition-all"
//                               onClick={() => updateBlogPost(post)}
//                               title="Edit Post"
//                             >
//                               <Edit2 className="w-5 h-5" />
//                             </button>
//                           )}

//                           {hasDeletePermission && (
//                             <button
//                               className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all"
//                               onClick={() => deleteBlogPost(post.id)}
//                               title="Delete Post"
//                             >
//                               <Trash2 className="w-5 h-5" />
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}

//                 {totalPages > 1 && (
//                   <div className="flex justify-center items-center gap-2 mt-8">
//                     <button
//                       onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
//                       disabled={currentPage === 1}
//                       className={`px-4 py-2 rounded-lg font-medium transition-all ${
//                         currentPage === 1 
//                           ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
//                           : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
//                       }`}
//                     >
//                       Previous
//                     </button>

//                     <span className="text-slate-400 px-4">
//                       Page {currentPage} of {totalPages}
//                     </span>

//                     <button
//                       onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
//                       disabled={currentPage === totalPages}
//                       className={`px-4 py-2 rounded-lg font-medium transition-all ${
//                         currentPage === totalPages 
//                           ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
//                           : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
//                       }`}
//                     >
//                       Next
//                     </button>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
//                 <Folder className="w-16 h-16 text-slate-600 mx-auto mb-4" />
//                 <h3 className="text-xl font-semibold text-white mb-2">
//                   {searchTerm ? 'No blog posts found matching your search' : 'No blog posts found'}
//                 </h3>
//                 <p className="text-slate-400">
//                   {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first blog post'}
//                 </p>
//                 {hasCreatePermission && !searchTerm && (
//                   <button
//                     className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
//                     onClick={handleAddBlogPost}
//                   >
//                     <Plus className="w-5 h-5" />
//                     Create Your First Post
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default BlogPostCom;




'use client';
import React, { useEffect, useState, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';

// Icons
const Search = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Plus = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const Filter = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const Eye = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const Edit2 = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const Trash2 = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const Calendar = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const User = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Folder = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const TrendingUp = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const Tag = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const BlogPostCom = () => {
  const router = useRouter();
  const { permissions = {} } = useContext(AuthContext);
  const [blogPosts, setBlogPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const recordsPerPage = 12;

  // Permission checks
  const hasReadPermission = permissions.read_blog_post || permissions.READ_BLOG_POST;
  const hasCreatePermission = permissions.create_blog_post || permissions.CREATE_BLOG_POST;
  const hasUpdatePermission = permissions.update_blog_post || permissions.UPDATE_BLOG_POST;
  const hasDeletePermission = permissions.delete_blog_post || permissions.DELETE_BLOG_POST;

  useEffect(() => {
    if (hasReadPermission) {
      fetchBlogPosts();
    }
  }, [currentPage, statusFilter, hasReadPermission]);

  const fetchBlogPosts = async () => {
    if (!hasReadPermission) {
      toast.error('You do not have permission to view blog posts');
      return;
    }

    setLoading(true);
    
    try {
      const params = {
        page: currentPage,
        limit: recordsPerPage,
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }

      const res = await AxiosInstance.get('/api/myapp/v1/blog/post/', { params });

      if (res?.data?.data && Array.isArray(res.data.data)) {
        setBlogPosts(res.data.data);
        setTotalCount(res.data.count || res.data.data.length);
        setTotalPages(Math.ceil((res.data.count || res.data.data.length) / recordsPerPage));
      } else {
        console.error('Unexpected response structure:', res);
        toast.error('Received unexpected data format from server');
        setBlogPosts([]);
        setTotalPages(1);
        setTotalCount(0);
      }
      
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to view blog posts');
      } else if (error.response?.status === 401) {
        toast.error('Please login to access blog posts');
      } else {
        toast.error(error.response?.data?.message || 'Error fetching blog posts');
      }
      setBlogPosts([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlogPost = async (id) => {
    if (!hasDeletePermission) {
      toast.error('You do not have permission to delete blog posts');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      const res = await AxiosInstance.delete(`/api/myapp/v1/blog/post/?id=${id}`);
      if (res) {
        toast.success('Blog post deleted successfully!');
        fetchBlogPosts();
      }
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to delete blog posts');
      } else if (error.response?.status === 404) {
        toast.error('Blog post not found');
      } else {
        toast.error(error.response?.data?.message || 'Error deleting blog post');
      }
    }
  };

  const updateBlogPost = (item) => {
    if (!hasUpdatePermission) {
      toast.error('You do not have permission to update blog posts');
      return;
    }
    router.push(`/updateblogpostpage?id=${item.id}`);
  };

  const viewBlogPost = (item) => {
    router.push(`/blogdetailpage?id=${item.id}`);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
  };

  const handleAddBlogPost = () => {
    if (!hasCreatePermission) {
      toast.error('You do not have permission to create blog posts');
      return;
    }
    router.push('/addblogpostpage');
  };

  const filteredBlogPosts = Array.isArray(blogPosts) ? blogPosts.filter((post) => {
    if (!post) return false;
    const titleMatch = post.title?.toLowerCase().includes(searchTerm);
    const authorMatch = post.author?.toLowerCase().includes(searchTerm);
    const createdByMatch = post.created_by?.toLowerCase().includes(searchTerm);
    const contentMatch = post.content?.toLowerCase().includes(searchTerm);
    const categoryMatch = post.category?.name?.toLowerCase().includes(searchTerm);
    const idMatch = post.id?.toString() === searchTerm;
    
    return titleMatch || authorMatch || createdByMatch || contentMatch || categoryMatch || idMatch;
  }) : [];

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'draft':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'archived':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString.replace(' ', 'T'));
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'N/A';
    }
  };

  // Calculate stats
  const publishedCount = blogPosts.filter(p => p?.status === 'published').length;
  const draftCount = blogPosts.filter(p => p?.status === 'draft').length;
  const uniqueCategoriesCount = new Set(blogPosts.map(p => p.category?.id).filter(Boolean)).size;

  if (!hasReadPermission) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-slate-400 mb-6">
            You don't have permission to view Blog Posts. Please contact your administrator.
          </p>
          <p className="text-xs text-slate-500 mb-6">
            Required permission: READ_BLOG_POST
          </p>
          <button 
            onClick={() => router.push('/')}
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
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="dark"
        className="mt-16"
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Blog Management
              </h1>
              <p className="text-slate-400 text-sm">Manage and organize your blog content</p>
            </div>

            {hasCreatePermission && (
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
                onClick={handleAddBlogPost}
              >
                <Plus className="w-5 h-5" />
                Create Post
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm font-medium">Total Posts</span>
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">{totalCount}</p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-5 hover:border-emerald-600/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm font-medium">Published</span>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <p className="text-3xl font-bold text-emerald-400">{publishedCount}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/30 backdrop-blur-sm border border-amber-700/30 rounded-xl p-5 hover:border-amber-600/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm font-medium">Drafts</span>
                <Edit2 className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-bold text-amber-400">{draftCount}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-purple-950/30 backdrop-blur-sm border border-purple-700/30 rounded-xl p-5 hover:border-purple-600/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm font-medium">Categories</span>
                <Folder className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-purple-400">{uniqueCategoriesCount}</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[250px] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, author, content, category, or ID..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
                >
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <p className="mt-6 text-slate-400 font-medium">Loading blog posts...</p>
          </div>
        )}

        {/* Blog Posts List with Images */}
        {!loading && (
          <div className="space-y-4">
            {filteredBlogPosts.length > 0 ? (
              <>
                {filteredBlogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/60 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 group"
                  >
                    <div className="flex gap-6 p-6">
                      {/* Featured Image */}
                      <div className="flex-shrink-0">
                        <div className="relative w-72 h-48 rounded-lg overflow-hidden bg-slate-800/50 border border-slate-700/50 group-hover:border-blue-500/30 transition-all">
                          {post.featured_image ? (
                            <>
                              <img
                                src={post.featured_image}
                                alt={post.featured_image_alt || post.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23334155" width="400" height="300"/%3E%3Ctext fill="%2394a3b8" font-family="Arial" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                              />
                              {post.is_featured && (
                                <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  Featured
                                </div>
                              )}
                              <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm text-slate-300 text-xs font-medium rounded-md border border-slate-700/50">
                                {post.reading_time || 0} min read
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                              <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm font-medium">No Image</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-2.5 py-1 bg-slate-700/50 text-slate-400 text-xs font-mono rounded-md border border-slate-600/30">
                                #{post.id}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(post.status)}`}>
                                {post.status?.charAt(0).toUpperCase() + post.status?.slice(1)}
                              </span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors" title={post.title}>
                              {post.title}
                            </h3>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-all hover:scale-110"
                              onClick={() => viewBlogPost(post)}
                              title="View Post"
                            >
                              <Eye className="w-5 h-5" />
                            </button>

                            {hasUpdatePermission && (
                              <button
                                className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg transition-all hover:scale-110"
                                onClick={() => updateBlogPost(post)}
                                title="Edit Post"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                            )}

                            {hasDeletePermission && (
                              <button
                                className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all hover:scale-110"
                                onClick={() => deleteBlogPost(post.id)}
                                title="Delete Post"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Subtitle */}
                        {post.subtitle && (
                          <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed" title={post.subtitle}>
                            {post.subtitle}
                          </p>
                        )}

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm mb-4">
                          <div className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{post.created_by || post.author || 'Unknown'}</span>
                          </div>

                          {post.category && (
                            <div className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors cursor-pointer">
                              <Folder className="w-4 h-4" />
                              <span>{post.category.name}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(post.published_at || post.created_at)}</span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-400">
                            <Eye className="w-4 h-4" />
                            <span>{post.view_count || 0} views</span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <span>{post.comments_count || 0} comments</span>
                          </div>
                        </div>

                        {/* Tags */}
                        {post.tags_list && Array.isArray(post.tags_list) && post.tags_list.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap mt-auto pt-3 border-t border-slate-700/50">
                            <Tag className="w-4 h-4 text-slate-500" />
                            {post.tags_list.map((tag) => (
                              <span
                                key={tag.id}
                                className="px-2.5 py-1 text-xs font-medium rounded-md border transition-all hover:scale-105 cursor-pointer"
                                style={{
                                  backgroundColor: `${tag.color}15`,
                                  borderColor: `${tag.color}40`,
                                  color: tag.color
                                }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8 pb-6">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === 1 
                          ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                          : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = index + 1;
                        } else if (currentPage <= 3) {
                          pageNum = index + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + index;
                        } else {
                          pageNum = currentPage - 2 + index;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
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
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === totalPages 
                          ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                          : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Folder className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchTerm ? 'No blog posts found matching your search' : 'No blog posts found'}
                </h3>
                <p className="text-slate-400 mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first blog post'}
                </p>
                {hasCreatePermission && !searchTerm && (
                  <button
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
                    onClick={handleAddBlogPost}
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Post
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostCom;