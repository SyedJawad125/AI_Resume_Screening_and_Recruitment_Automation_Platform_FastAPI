'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight, Clock, Tag, Loader } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';

export default function BlogsPage() {
  const router = useRouter();
  const [blogData, setBlogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const recordsPerPage = 12;

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, selectedCategory]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = {
        page: currentPage,
        limit: recordsPerPage,
      };
      
      // Add category filter if not 'All'
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      // Using AxiosInstance
      const res = await AxiosInstance.get('/api/myapp/v1/public/blog/post/', { params });
      
      if (res?.data?.message === "Successful" && Array.isArray(res.data.data)) {
        // Transform backend data to match frontend structure
        const transformedBlogs = res.data.data.map(blog => ({
          id: blog.id,
          title: blog.title,
          excerpt: blog.excerpt || blog.subtitle || '',
          description: blog.content || '',
          image: blog.featured_image || 'https://images.unsplash.com/photo-1499750810403-62c5b5975f5e?w=800&q=80',
          category: blog.category?.name || 'Uncategorized',
          author: blog.author || blog.created_by || 'Unknown',
          date: blog.published_at || blog.created_at,
          readTime: `${blog.reading_time || 5} min read`,
          featured: blog.is_featured || false,
          tags: blog.tags_list || [],
          views: blog.view_count || 0,
          commentsCount: blog.comments_count || 0,
          status: blog.status || 'published'
        }));
        
        setBlogData(transformedBlogs);
        
        // Set pagination
        setTotalPages(res.data.total_pages || Math.ceil((res.data.count || 0) / recordsPerPage) || 1);
        setTotalCount(res.data.count || transformedBlogs.length || 0);
        
        // Extract unique categories (only on first load)
        if (currentPage === 1 && selectedCategory === 'All') {
          const uniqueCategories = ['All', ...new Set(transformedBlogs.map(blog => blog.category))];
          setCategories(uniqueCategories);
        }

        if (transformedBlogs.length === 0) {
          toast.info('No blog posts found');
        }
      } else {
        setBlogData([]);
        toast.info('No blog posts available');
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error fetching blog posts';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = selectedCategory === 'All' 
    ? blogData 
    : blogData.filter(blog => blog.category === selectedCategory);

  const handleBlogClick = (blogId) => {
    console.log('Navigate to blog:', blogId);
    router.push(`/blog/?blogId=${blogId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Recent';
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fdfaf6] via-[#f9f6f1] to-[#f7f3ec] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#d4af37] animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading blogs...</p>
        </div>
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          theme="light"
        />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fdfaf6] via-[#f9f6f1] to-[#f7f3ec] flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">
            Failed to Load Blogs
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchBlogs}
            className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#e8c547] text-black font-semibold rounded-full hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          theme="light"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfaf6] via-[#f9f6f1] to-[#f7f3ec]">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="light"
      />
      
      {/* Decorative background elements */}
      <div className="fixed top-20 left-10 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
      <div className="fixed bottom-20 right-10 w-80 h-80 bg-[#e8c547]/5 rounded-full blur-3xl"></div>

      {/* Header Section */}
      <div className="relative pt-20 pb-12 px-6 md:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6 animate-fadeIn">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
            <span className="text-[#d4af37] text-xs font-semibold tracking-[0.3em] uppercase">
              Our Stories
            </span>
            <div className="w-12 h-px bg-gradient-to-r from-[#d4af37] via-transparent to-transparent"></div>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-[#2a1f0f] mb-6 animate-slideUp">
            Insights & Inspiration
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light animate-fadeInDelay">
            Explore articles crafted with passion, covering trends, strategies, and stories that matter.
          </p>
        </div>

        {/* Category Filter */}
        <div className="max-w-4xl mx-auto mt-12 animate-fadeInDelay2">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-[#d4af37] via-[#e8c547] to-[#d4af37] text-black shadow-[0_5px_20px_rgba(212,175,55,0.4)] scale-105'
                    : 'bg-white/80 text-gray-700 border border-[#e6d5b8]/50 hover:border-[#d4af37]/50 hover:shadow-md'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Blog (First Blog) */}
      {filteredBlogs.length > 0 && filteredBlogs[0].featured && (
        <div className="relative px-6 md:px-20 mb-20">
          <div className="max-w-7xl mx-auto">
            <div 
              className="relative flex flex-col md:flex-row items-center md:items-stretch rounded-2xl border border-[#e6d5b8]/50 bg-white/90 backdrop-blur-xl shadow-[0_10px_60px_rgba(212,175,55,0.12)] overflow-hidden group hover:shadow-[0_15px_80px_rgba(212,175,55,0.25)] transition-all duration-700 ease-in-out cursor-pointer"
              onClick={() => handleBlogClick(filteredBlogs[0].id)}
            >
              <div className="relative w-full md:w-1/2 overflow-hidden">
                <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#d4af37]/40 z-10"></div>
                
                <img
                  src={filteredBlogs[0].image}
                  alt={filteredBlogs[0].title}
                  className="w-full h-full min-h-[400px] md:min-h-[600px] object-cover transform group-hover:scale-110 transition-transform duration-[3000ms] ease-out brightness-[0.95] group-hover:brightness-100"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1499750810403-62c5b5975f5e?w=800&q=80';
                  }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-[#d4af37]/10"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#d4af37]/40"></div>

                <div className="absolute top-6 right-6 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#e8c547] text-black text-xs font-bold tracking-wider rounded-full shadow-lg">
                  FEATURED
                </div>
              </div>

              <div className="relative w-full md:w-1/2 p-10 md:p-14 lg:p-16 text-gray-800 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-px bg-gradient-to-r from-[#d4af37] to-transparent"></div>
                  <span className="text-[#d4af37] text-xs font-semibold tracking-[0.3em] uppercase">
                    {filteredBlogs[0].category}
                  </span>
                </div>

                <div className="relative mb-8">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#d4af37] via-[#e8c547] to-[#d4af37] rounded-full"></div>
                  <h2 className="pl-6 text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2a1f0f] leading-tight">
                    {filteredBlogs[0].title}
                  </h2>
                </div>

                <div className="space-y-5 mb-8">
                  <p className="text-lg md:text-xl leading-relaxed text-gray-700 font-light">
                    {filteredBlogs[0].excerpt}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#d4af37]" />
                    <span>{filteredBlogs[0].author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#d4af37]" />
                    <span>{formatDate(filteredBlogs[0].date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#d4af37]" />
                    <span>{filteredBlogs[0].readTime}</span>
                  </div>
                </div>

                {filteredBlogs[0].tags && filteredBlogs[0].tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {filteredBlogs[0].tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                          border: `1px solid ${tag.color}40`
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBlogClick(filteredBlogs[0].id);
                  }}
                  className="group/btn relative w-fit px-8 py-3.5 bg-gradient-to-r from-[#d4af37] via-[#e8c547] to-[#d4af37] text-black font-semibold rounded-full overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Read Full Story
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity duration-500"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Grid */}
      <div className="relative px-6 md:px-20 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.slice(filteredBlogs[0]?.featured ? 1 : 0).map((blog, index) => (
              <div
                key={blog.id}
                className="group relative bg-white/90 backdrop-blur-xl rounded-2xl border border-[#e6d5b8]/50 overflow-hidden hover:shadow-[0_15px_60px_rgba(212,175,55,0.2)] transition-all duration-500 cursor-pointer hover:-translate-y-2"
                onClick={() => handleBlogClick(blog.id)}
                onMouseEnter={() => setHoveredCard(blog.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1499750810403-62c5b5975f5e?w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#d4af37]/90 backdrop-blur-sm text-white text-xs font-bold tracking-wider rounded-full flex items-center gap-1.5">
                    <Tag className="w-3 h-3" />
                    {blog.category}
                  </div>

                  <div className={`absolute top-4 right-4 w-10 h-10 bg-gradient-to-r from-[#d4af37] to-[#e8c547] rounded-full flex items-center justify-center transition-all duration-300 ${
                    hoveredCard === blog.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}>
                    <ArrowRight className="w-5 h-5 text-black" />
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-serif font-bold text-[#2a1f0f] mb-3 line-clamp-2 group-hover:text-[#d4af37] transition-colors duration-300">
                    {blog.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {blog.excerpt}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-4 border-t border-[#e6d5b8]/50">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>{formatDate(blog.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>{blog.readTime}</span>
                    </div>
                  </div>

                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 text-xs font-semibold rounded-md"
                          style={{
                            backgroundColor: `${tag.color}15`,
                            color: tag.color
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBlogClick(blog.id);
                    }}
                    className="mt-4 flex items-center gap-2 text-[#d4af37] font-semibold text-sm group-hover:gap-3 transition-all duration-300"
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#d4af37]/30 rounded-br-lg"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  currentPage === 1 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white/80 text-gray-700 hover:bg-[#d4af37] hover:text-black border border-[#e6d5b8]/50'
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
                      className={`w-12 h-12 rounded-full font-semibold transition-all ${
                        currentPage === pageNum 
                          ? 'bg-gradient-to-r from-[#d4af37] to-[#e8c547] text-black shadow-lg' 
                          : 'bg-white/80 text-gray-700 hover:bg-[#d4af37]/20 border border-[#e6d5b8]/50'
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
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  currentPage === totalPages 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white/80 text-gray-700 hover:bg-[#d4af37] hover:text-black border border-[#e6d5b8]/50'
                }`}
              >
                Next
              </button>
            </div>
          )}

          {/* No Results Message */}
          {filteredBlogs.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="w-10 h-10 text-[#d4af37]" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#2a1f0f] mb-3">
                No blogs found
              </h3>
              <p className="text-gray-600">
                {selectedCategory === 'All' 
                  ? 'No blog posts available at the moment' 
                  : 'Try selecting a different category'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Elegant Footer Glow */}
      <div className="relative pb-20">
        <div className="flex justify-center">
          <div className="w-96 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-pulse-slow"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-br from-[#d4af37] to-[#e8c547] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.8)]"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes pulseSlow {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 1s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 1.2s ease-in forwards;
        }
        .animate-fadeInDelay {
          animation: fadeIn 1.5s ease-in 0.3s forwards;
          opacity: 0;
        }
        .animate-fadeInDelay2 {
          animation: fadeIn 1.5s ease-in 0.6s forwards;
          opacity: 0;
        }
        .animate-pulse-slow {
          animation: pulseSlow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}