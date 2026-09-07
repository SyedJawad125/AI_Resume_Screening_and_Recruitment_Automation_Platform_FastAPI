import React, { useEffect, useState, useContext } from 'react';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from '@/components/AuthContext';

const PermissionsCom = () => {
  const router = useRouter();
  const { permissions = {} } = useContext(AuthContext);
  const [permissionsList, setPermissionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Fetch permissions with backend pagination
  const fetchPermissions = async (page = 1) => {
    setLoading(true);
    try {
      // Calculate skip value for backend
      const skip = (page - 1) * pagination.limit;
      
      const response = await AxiosInstance.get('/api/permissions/v1/permission/', {
        params: {
          skip: skip,
          limit: pagination.limit,
          include_deleted: false
        }
      });
      
      if (response.data.status === 'success') {
        const { count, data } = response.data.result;
        
        setPermissionsList(data);
        
        // Update pagination with backend response
        const totalPages = Math.ceil(count / pagination.limit);
        setPagination(prev => ({
          ...prev,
          page: page,
          total: count,
          totalPages: totalPages
        }));
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Error fetching permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if returning from update page
    const savedPage = sessionStorage.getItem('permissionsCurrentPage');
    if (savedPage) {
      const pageNumber = parseInt(savedPage, 10);
      setPagination(prev => ({ ...prev, page: pageNumber }));
      fetchPermissions(pageNumber);
      sessionStorage.removeItem('permissionsCurrentPage');
    } else {
      fetchPermissions(pagination.page);
    }
  }, []);

  const updatePermission = (id) => {
    // Store current page before navigating
    sessionStorage.setItem('permissionsCurrentPage', pagination.page);
    router.push(`/adminupdatepermissions?id=${id}`);
  };

  const deletePermission = async (id) => {
    if (!window.confirm('Are you sure you want to delete this permission?')) {
      return;
    }

    try {
      const res = await AxiosInstance.delete(`/api/permissions/v1/permission/${id}`);
      if (res?.data?.message) {
        toast.success(res.data.message);

        // Check if current page will be empty after deletion
        const remainingOnPage = permissionsList.length - 1;
        
        if (remainingOnPage === 0 && pagination.page > 1) {
          // If current page becomes empty and we're not on page 1, go to previous page
          const newPage = pagination.page - 1;
          setPagination(prev => ({ ...prev, page: newPage }));
          fetchPermissions(newPage);
        } else {
          // Refresh current page
          fetchPermissions(pagination.page);
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Permission not found');
      } else if (error.response?.status === 400) {
        // Handle the case where permission is assigned to roles or users
        const errorMessage = error.response?.data?.detail || 'Cannot delete permission';
        toast.error(errorMessage);
      } else {
        const errorMessage = error.response?.data?.detail || 'Error deleting permission';
        toast.error(errorMessage);
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      fetchPermissions(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Check for show_role permission (to view permissions page)
  if (!permissions.show_role) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl text-amber-400 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">
            You don't have permission to view Permissions. Please contact your administrator.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-700 text-white"
          >
            Return to Dashboard
          </button>
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="backdrop-blur-xl bg-gradient-to-r from-slate-900/60 to-slate-800/40 rounded-2xl border border-purple-400/20 shadow-2xl shadow-purple-500/10 p-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-indigo-300 to-cyan-300 bg-clip-text text-transparent mb-4">
              Permissions Management
            </h1>
            <div className="flex items-center text-sm text-slate-400 space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Total: <span className="text-purple-300">{pagination.total}</span> records</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Page <span className="text-indigo-300">{pagination.page}</span> of <span className="text-cyan-300">{pagination.totalPages}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Permission Button */}
        {permissions.create_role && (
          <div className="mb-8">
            <button
              onClick={() => router.push('/adminaddpermissions')}
              className="group relative px-8 py-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 text-amber-300 rounded-2xl hover:from-amber-500/30 hover:to-orange-500/30 hover:border-amber-400/50 transition-all duration-300 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 backdrop-blur-sm font-semibold"
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center">
                  <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Add New Permission</span>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        )}

        {loading ? (
          <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 rounded-2xl border border-purple-400/20 shadow-2xl shadow-purple-500/10 overflow-hidden">
            <div className="space-y-0">
              {[...Array(pagination.limit)].map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 p-6 border-b border-slate-700/20 last:border-b-0">
                  <div className="col-span-2 h-8 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg animate-pulse"></div>
                  <div className="col-span-2 h-8 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg animate-pulse"></div>
                  <div className="col-span-4 h-8 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg animate-pulse"></div>
                  <div className="col-span-3 h-8 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg animate-pulse"></div>
                  <div className="col-span-1 h-8 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Luxury Table Container */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 rounded-2xl border border-purple-400/20 shadow-2xl shadow-purple-500/10 overflow-hidden">
              
              {/* Table Header */}
              <div className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-b border-purple-400/20">
                <div className="grid grid-cols-12 gap-4 px-6 py-4">
                  <div className="col-span-2 font-semibold text-purple-300 text-xs uppercase tracking-wider">Code</div>
                  <div className="col-span-2 font-semibold text-purple-300 text-xs uppercase tracking-wider">Name</div>
                  <div className="col-span-4 font-semibold text-purple-300 text-xs uppercase tracking-wider">Description</div>
                  <div className="col-span-3 font-semibold text-purple-300 text-xs uppercase tracking-wider">Module Name</div>
                  <div className="col-span-1 font-semibold text-purple-300 text-xs uppercase tracking-wider text-center">Actions</div>
                </div>
              </div>

              {/* Data Rows */}
              <div className="divide-y divide-slate-700/20">
                {permissionsList.length > 0 ? (
                  permissionsList.map((permission, index) => (
                    <div 
                      key={permission.id} 
                      className={`grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gradient-to-r hover:from-purple-500/8 hover:to-indigo-500/8 transition-all duration-300 group cursor-pointer ${
                        index % 2 === 0 ? 'bg-slate-900/10' : 'bg-slate-800/15'
                      }`}
                    >
                      {/* Code */}
                      <div className="col-span-2">
                        <span className="inline-flex items-center px-2 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-200 border border-purple-400/30 backdrop-blur-sm shadow-lg shadow-purple-500/10 group-hover:shadow-purple-500/20 transition-all duration-300">
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mr-2 animate-pulse"></div>
                          {permission.code}
                        </span>
                      </div>
                      
                      {/* Name */}
                      <div className="col-span-2">
                        <span className="text-slate-200 text-sm group-hover:text-white transition-colors duration-300 bg-slate-800/30 px-3 py-2 rounded-lg border border-slate-700/40 backdrop-blur-sm">
                          {permission.name}
                        </span>
                      </div>
                      
                      {/* Description */}
                      <div className="col-span-4">
                        <div 
                          className="text-slate-300 text-sm group-hover:text-slate-200 transition-colors duration-300 bg-slate-700/20 px-3 py-2 rounded-lg border border-slate-600/30 backdrop-blur-sm truncate" 
                          title={permission.description}
                        >
                          {permission.description}
                        </div>
                      </div>
                      
                      {/* Module Name */}
                      <div className="col-span-3">
                        {permission.module_name ? (
                          <span className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border border-cyan-400/30 backdrop-blur-sm shadow-lg shadow-cyan-500/10">
                            <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mr-2"></div>
                            {permission.module_name}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-xs bg-slate-800/20 px-3 py-2 rounded-lg border border-slate-700/20">N/A</span>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="col-span-1 flex justify-center space-x-2">
                        {permissions.update_role && (
                          <button 
                            onClick={() => updatePermission(permission.id)}
                            className="p-2.5 text-indigo-300 hover:text-indigo-200 bg-indigo-500/15 hover:bg-indigo-500/25 rounded-xl transition-all duration-300 border border-indigo-400/30 hover:border-indigo-300/50 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 backdrop-blur-sm group"
                            title="Edit Permission"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                        )}
                        {permissions.delete_role && (
                          <button 
                            onClick={() => deletePermission(permission.id)}
                            className="p-2.5 text-rose-300 hover:text-rose-200 bg-rose-500/15 hover:bg-rose-500/25 rounded-xl transition-all duration-300 border border-rose-400/30 hover:border-rose-300/50 shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 backdrop-blur-sm group"
                            title="Delete Permission"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-lg">No permissions found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Luxury Pagination */}
            {permissionsList.length > 0 && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                {/* Results Info */}
                <div className="backdrop-blur-xl bg-gradient-to-r from-slate-800/60 to-slate-700/40 px-6 py-3 rounded-2xl border border-slate-600/30 shadow-lg shadow-slate-500/10">
                  <div className="text-sm text-slate-400">
                    Showing <span className="font-bold text-purple-300">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                    <span className="font-bold text-indigo-300">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-bold text-cyan-300">{pagination.total}</span> results
                  </div>
                </div>
                
                {/* Pagination Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`px-6 py-3 rounded-2xl border font-medium transition-all duration-300 backdrop-blur-sm ${
                      pagination.page === 1 
                        ? 'text-slate-600 border-slate-700/50 cursor-not-allowed bg-slate-800/20' 
                        : 'text-slate-300 border-slate-600/50 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:border-slate-500/70 hover:text-white shadow-lg hover:shadow-slate-500/20'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-2">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-12 h-12 rounded-2xl font-bold transition-all duration-300 backdrop-blur-sm ${
                            pagination.page === pageNum 
                              ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-white border border-purple-400/50 shadow-lg shadow-purple-500/20' 
                              : 'text-slate-300 border border-slate-600/50 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:border-slate-500/70 hover:text-white shadow-lg hover:shadow-slate-500/20'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`px-6 py-3 rounded-2xl border font-medium transition-all duration-300 backdrop-blur-sm ${
                      pagination.page === pagination.totalPages 
                        ? 'text-slate-600 border-slate-700/50 cursor-not-allowed bg-slate-800/20' 
                        : 'text-slate-300 border-slate-600/50 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:border-slate-500/70 hover:text-white shadow-lg hover:shadow-slate-500/20'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default PermissionsCom;