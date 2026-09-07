'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight, Clock, Tag, Loader, Star, Bookmark, Eye, MessageCircle, Sparkles } from 'lucide-react';
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
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState(new Set());
  const recordsPerPage = 12;

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, selectedCategory]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: recordsPerPage,
      };
      
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      const res = await AxiosInstance.get('/api/myapp/v1/public/blog/post/', { params });
      
      if (res?.data?.message === "Successful" && Array.isArray(res.data.data)) {
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
          status: blog.status || 'published',
          likes: Math.floor(Math.random() * 100) + 10
        }));
        
        setBlogData(transformedBlogs);
        setTotalPages(res.data.total_pages || Math.ceil((res.data.count || 0) / recordsPerPage) || 1);
        setTotalCount(res.data.count || transformedBlogs.length || 0);
        
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

  const handleBookmark = (blogId, e) => {
    e.stopPropagation();
    const newBookmarked = new Set(bookmarkedBlogs);
    if (newBookmarked.has(blogId)) {
      newBookmarked.delete(blogId);
      toast.success('Removed from bookmarks');
    } else {
      newBookmarked.add(blogId);
      toast.success('Added to bookmarks');
    }
    setBookmarkedBlogs(newBookmarked);
  };

  const filteredBlogs = selectedCategory === 'All' 
    ? blogData 
    : blogData.filter(blog => blog.category === selectedCategory);

  const handleBlogClick = (blogId) => {
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
      <div className="min-h-screen bg-white flex items-center justify-center relative">
        <div className="text-center">
          <div className="relative">
            <Loader className="w-16 h-16 text-amber-600 animate-spin mx-auto mb-6" />
            <Sparkles className="w-8 h-8 text-amber-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <p className="text-xl text-slate-700 font-light">Curating Premium Content</p>
          <p className="text-sm text-slate-500 mt-2">Experience luxury reading</p>
        </div>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-white rounded-3xl p-12 border border-amber-200 shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span className="text-amber-600 text-2xl">✨</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4">
            Refined Content Unavailable
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">{error}</p>
          <button 
            onClick={fetchBlogs}
            className="px-8 py-4 bg-gradient-to-r from-amber-600 to-rose-600 text-white font-semibold rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      
      {/* Simple Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10% left-5% w-80 h-80 bg-amber-50/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20% right-10% w-96 h-96 bg-rose-50/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header Section */}
      <div className="relative pt-28 pb-16 px-6 md:px-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-8 animate-fadeIn">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-600/40 to-transparent"></div>
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold tracking-[0.3em] uppercase">
              <Sparkles className="w-4 h-4" />
              Our Stories
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="w-16 h-px bg-gradient-to-r from-amber-600/40 via-transparent to-transparent"></div>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-slate-800 mb-8 animate-slideUp leading-[0.9]">
            Insights
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 mt-4">
              & Inspiration
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto font-light animate-fadeInDelay leading-relaxed">
            Explore articles crafted with passion, covering trends, strategies, and stories that matter.
          </p>

          {/* Stats Bar */}
          <div className="flex justify-center items-center gap-12 mt-12 animate-fadeInDelay2">
            <div className="text-center">
              <div className="text-3xl font-serif font-bold text-amber-600">{totalCount}+</div>
              <div className="text-sm text-slate-500 uppercase tracking-wider">Premium Articles</div>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-amber-300 to-transparent"></div>
            <div className="text-center">
              <div className="text-3xl font-serif font-bold text-rose-600">{categories.length - 1}+</div>
              <div className="text-sm text-slate-500 uppercase tracking-wider">Exclusive Categories</div>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-amber-300 to-transparent"></div>
            <div className="text-center">
              <div className="text-3xl font-serif font-bold text-slate-700">{Math.floor(totalCount * 4.7)}+</div>
              <div className="text-sm text-slate-500 uppercase tracking-wider">Minutes of Excellence</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="max-w-6xl mx-auto mt-16 animate-fadeInDelay2">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`group relative px-8 py-4 rounded-2xl font-semibold transition-all duration-500 overflow-hidden ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-2xl shadow-amber-500/25 scale-105'
                    : 'bg-white text-slate-700 border border-amber-200 hover:border-amber-300 hover:shadow-xl'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {category}
                  {selectedCategory === category && (
                    <Sparkles className="w-4 h-4" />
                  )}
                </span>
                <div className={`absolute inset-0 bg-gradient-to-r from-amber-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  selectedCategory === category ? 'opacity-20' : ''
                }`}></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Blog */}
      {filteredBlogs.length > 0 && filteredBlogs[0].featured && (
        <div className="relative px-6 md:px-20 mb-24">
          <div className="max-w-7xl mx-auto">
            <div 
              className="relative group cursor-pointer"
              onClick={() => handleBlogClick(filteredBlogs[0].id)}
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-rose-600/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-1000"></div>
              
              <div className="relative bg-white rounded-3xl border border-amber-200 shadow-2xl overflow-hidden group-hover:shadow-3xl transition-all duration-700">
                <div className="grid grid-cols-1 xl:grid-cols-2 min-h-[600px]">
                  {/* Image Section */}
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/5 to-rose-600/5 z-10"></div>
                    <img
                      src={filteredBlogs[0].image}
                      alt={filteredBlogs[0].title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2000ms] ease-out"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1499750810403-62c5b5975f5e?w=800&q=80';
                      }}
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-6 left-6 z-20">
                      <div className="flex flex-col gap-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-amber-600 to-rose-600 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-2">
                          <Star className="w-4 h-4 fill-current" />
                          Editor's Choice
                        </div>
                        <div className="px-3 py-1.5 bg-white/90 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                          {filteredBlogs[0].category}
                        </div>
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-amber-400/50 rounded-tr-2xl"></div>
                    <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-rose-400/50 rounded-bl-2xl"></div>
                  </div>

                  {/* Content Section */}
                  <div className="relative p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-px bg-gradient-to-r from-amber-600 to-transparent"></div>
                      <span className="text-amber-600 text-xs font-semibold tracking-[0.3em] uppercase">
                        Featured Masterpiece
                      </span>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-800 mb-6 leading-tight">
                      {filteredBlogs[0].title}
                    </h2>

                    <p className="text-lg text-slate-600 mb-8 leading-relaxed font-light">
                      {filteredBlogs[0].excerpt}
                    </p>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-amber-600" />
                        <span className="font-medium">{filteredBlogs[0].author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-rose-600" />
                        <span>{formatDate(filteredBlogs[0].date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>{filteredBlogs[0].readTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-slate-500" />
                        <span>{filteredBlogs[0].views}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBlogClick(filteredBlogs[0].id);
                        }}
                        className="group/btn relative px-8 py-4 bg-gradient-to-r from-amber-600 to-rose-600 text-white font-semibold rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105"
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          Read Full Story
                          <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity duration-500"></div>
                      </button>

                      <button 
                        onClick={(e) => handleBookmark(filteredBlogs[0].id, e)}
                        className={`p-4 rounded-2xl border transition-all duration-300 ${
                          bookmarkedBlogs.has(filteredBlogs[0].id)
                            ? 'bg-amber-50 border-amber-300 text-amber-600'
                            : 'bg-white border-amber-200 text-slate-400 hover:border-amber-300'
                        }`}
                      >
                        <Bookmark className={`w-5 h-5 ${bookmarkedBlogs.has(filteredBlogs[0].id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blog Grid */}
      <div className="relative px-6 md:px-20 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredBlogs.slice(filteredBlogs[0]?.featured ? 1 : 0).map((blog, index) => (
              <div
                key={blog.id}
                className="group relative bg-white rounded-3xl border border-amber-200 overflow-hidden hover:shadow-3xl transition-all duration-700 cursor-pointer hover:-translate-y-3"
                onClick={() => handleBlogClick(blog.id)}
                onMouseEnter={() => setHoveredCard(blog.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2000ms] ease-out"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1499750810403-62c5b5975f5e?w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="px-3 py-1.5 bg-white/90 text-amber-700 text-xs font-bold rounded-full border border-amber-200 flex items-center gap-1.5">
                      <Tag className="w-3 h-3" />
                      {blog.category}
                    </div>
                    {blog.featured && (
                      <div className="px-2 py-1 bg-gradient-to-r from-amber-600 to-rose-600 text-white text-xs font-bold rounded-full">
                        FEATURED
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button 
                      onClick={(e) => handleBookmark(blog.id, e)}
                      className={`p-2 rounded-full bg-white/80 transition-all duration-300 ${
                        bookmarkedBlogs.has(blog.id)
                          ? 'bg-amber-500 text-white shadow-lg'
                          : 'text-slate-600 hover:bg-white'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${bookmarkedBlogs.has(blog.id) ? 'fill-current' : ''}`} />
                    </button>
                    
                    <div className={`p-2 bg-gradient-to-r from-amber-600 to-rose-600 rounded-full transition-all duration-300 ${
                      hoveredCard === blog.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    }`}>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                </div>

                <div className="relative p-6">
                  <h3 className="text-xl font-serif font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-amber-700 transition-colors duration-300 leading-tight">
                    {blog.title}
                  </h3>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed font-light">
                    {blog.excerpt}
                  </p>

                  {/* Meta Information */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-amber-600" />
                        <span>{blog.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-600" />
                        <span>{formatDate(blog.date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{blog.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{blog.views}</span>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-amber-200">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{blog.commentsCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span>{blog.likes}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBlogClick(blog.id);
                      }}
                      className="flex items-center gap-2 text-amber-600 font-semibold text-sm group-hover:gap-3 transition-all duration-300 hover:text-rose-600"
                    >
                      <span>Read More</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Decorative Corner */}
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-400/30 rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-16">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-500 ${
                  currentPage === 1 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                    : 'bg-white text-slate-700 hover:bg-gradient-to-r hover:from-amber-600 hover:to-rose-600 hover:text-white border border-amber-200 hover:border-transparent hover:shadow-2xl'
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
                      className={`w-14 h-14 rounded-2xl font-semibold transition-all duration-500 ${
                        currentPage === pageNum 
                          ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-2xl scale-110' 
                          : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-200 hover:border-amber-300'
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
                className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-500 ${
                  currentPage === totalPages 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                    : 'bg-white text-slate-700 hover:bg-gradient-to-r hover:from-amber-600 hover:to-rose-600 hover:text-white border border-amber-200 hover:border-transparent hover:shadow-2xl'
                }`}
              >
                Next
              </button>
            </div>
          )}

          {/* No Results */}
          {filteredBlogs.length === 0 && (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Sparkles className="w-12 h-12 text-amber-600" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-slate-800 mb-4">
                No blogs found
              </h3>
              <p className="text-slate-600 text-lg max-w-md mx-auto leading-relaxed">
                {selectedCategory === 'All' 
                  ? 'No blog posts available at the moment' 
                  : 'Try selecting a different category'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Element */}
      <div className="relative pb-20">
        <div className="flex justify-center">
          <div className="w-96 h-px bg-gradient-to-r from-transparent via-amber-600/30 to-transparent shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-pulse-slow"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-amber-400 to-rose-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.8)] animate-ping-slow"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
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
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
        @keyframes pingSlow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%, 100% {
            transform: scale(2);
            opacity: 0;
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
          animation: pulseSlow 4s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: pingSlow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}