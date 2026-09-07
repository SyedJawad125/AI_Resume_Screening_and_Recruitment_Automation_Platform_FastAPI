import React, { useEffect, useState, useContext } from 'react';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from '@/components/AuthContext';

const RolesCom = () => {
  const router = useRouter();
  const { permissions = {} } = useContext(AuthContext);
  const [rolesList, setRolesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    code: '',
    name: ''
  });
  const [allPermissions, setAllPermissions] = useState([]); // Store all permissions

  // Fetch all permissions
  const fetchAllPermissions = async () => {
    try {
      // Fetch all permissions without pagination
      const response = await AxiosInstance.get('/api/permissions/v1/permission/', {
        params: {
          skip: 0,
          limit: 1000, // Fetch a large number
          include_deleted: false
        }
      });
      
      if (response.data.status === 'success') {
        // Store permissions in state
        setAllPermissions(response.data.result.data || []);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Error loading permissions');
    }
  };

  const fetchRoles = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        skip: (page - 1) * pagination.limit,
        limit: pagination.limit,
        include_deleted: includeDeleted
      };

      // Add filters if they exist
      if (filters.search) params.search = filters.search;
      if (filters.code) params.code = filters.code;
      if (filters.name) params.name = filters.name;

      const response = await AxiosInstance.get('/api/roles/v1/role/', {
        params: params
      });
      
      if (response.data && response.data.status === "success") {
        const data = response.data.result;
        const rolesData = data.data || [];
        
        // Check if roles have permissions as objects or just IDs
        const processedRoles = rolesData.map(role => {
          // If role.permissions is an array of permission objects, use them directly
          // If it's an array of IDs, map them to permission objects
          let rolePermissions = [];
          
          if (role.permissions && Array.isArray(role.permissions)) {
            if (role.permissions.length > 0 && typeof role.permissions[0] === 'object') {
              // Permissions are already objects
              rolePermissions = role.permissions;
            } else {
              // Permissions are IDs, map to permission objects
              rolePermissions = role.permissions.map(permId => {
                // Find the permission in allPermissions
                const foundPerm = allPermissions.find(p => p.id === permId);
                return foundPerm || { id: permId, name: `Permission ${permId}`, code: `perm_${permId}` };
              });
            }
          }
          
          return {
            ...role,
            permissions: rolePermissions
          };
        });
        
        setRolesList(processedRoles);
        setPagination(prev => ({
          ...prev,
          page,
          total: data.count || 0,
          totalPages: Math.ceil((data.count || 0) / pagination.limit)
        }));
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error(error.response?.data?.detail || 'Error fetching roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // First fetch permissions, then fetch roles
    const initializeData = async () => {
      await fetchAllPermissions();
      fetchRoles(pagination.page);
    };
    
    initializeData();
  }, [includeDeleted]);

  // Re-fetch roles when allPermissions changes
  useEffect(() => {
    if (allPermissions.length > 0 && rolesList.length === 0) {
      fetchRoles(pagination.page);
    }
  }, [allPermissions]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      fetchRoles(newPage);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchRoles(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      code: '',
      name: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchRoles(1);
  };

  const updateRole = (id) => {
    router.push(`/UpdateRole?id=${id}`);
  };

  const deleteRole = async (id, permanent = false) => {
    if (!window.confirm(`Are you sure you want to ${permanent ? 'permanently ' : ''}delete this role?`)) {
      return;
    }

    try {
      const response = await AxiosInstance.delete(`/api/roles/v1/role/${id}/`, {
        params: { permanent }
      });
      
      toast.success(response.data?.message || "Role deleted successfully!");
      fetchRoles(pagination.page);

    } catch (error) {
      console.error("Delete role error:", error);

      if (error.response) {
        const { status, data } = error.response;
        const message = data?.detail || data?.message || "Error deleting role";

        switch (status) {
          case 404:
            toast.error(message);
            break;
          case 400:
            toast.error(message);
            break;
          case 401:
            toast.error("You are not authorized to delete roles");
            break;
          case 403:
            toast.error("You don't have permission to delete roles");
            break;
          case 500:
            toast.error(message);
            break;
          default:
            toast.error(message);
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Unexpected error occurred while deleting role");
      }
    }
  };

  const restoreRole = async (id) => {
    try {
      await AxiosInstance.post(`/api/roles/v1/role/${id}/restore`);
      toast.success("Role restored successfully!");
      fetchRoles(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error restoring role");
    }
  };

  // Format permissions display - show 2-3 with "+X more" for the rest
  const renderPermissions = (rolePermissions) => {
    if (!rolePermissions || rolePermissions.length === 0) {
      return (
        <span className="text-slate-500 italic text-sm bg-slate-800/30 px-3 py-1.5 rounded-lg border border-slate-700/40">
          No permissions
        </span>
      );
    }

    const displayCount = 2; // Show only 2 permissions
    const displayPermissions = rolePermissions.slice(0, displayCount);
    const remaining = rolePermissions.length - displayCount;
    
    return (
      <div className="flex flex-wrap gap-1.5">
        {displayPermissions.map((permission) => (
          <span 
            key={permission.id}
            className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-sm hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-200 cursor-help"
            title={`${permission.name} (${permission.code || permission.id})`}
          >
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5"></div>
            {permission.name}
          </span>
        ))}
        {remaining > 0 && (
          <span 
            className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-slate-600/50 to-slate-700/50 text-slate-300 border border-slate-600/50 backdrop-blur-sm cursor-help"
            title={rolePermissions.slice(displayCount).map(p => p.name).join(', ')}
          >
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-1.5"></div>
            +{remaining} more
          </span>
        )}
      </div>
    );
  };

  // Check for read permissions
  if (!permissions.read_role) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl text-amber-400 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">
            You don't have permission to view Roles. Please contact your administrator.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-700 text-white"
          >
            Return to Dashboard
          </button>
        </div>
        <Toaster position="top-right" autoClose={2000} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-amber-500/8 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500/6 to-amber-500/6 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/4 to-yellow-500/4 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Premium Header Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <svg className="w-6 h-6 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
                Roles Management
              </h1>
              <p className="text-slate-400 text-lg mt-1">Manage system access and permissions</p>
            </div>
          </div>
          
          {/* Filters Section */}
          <div className="mb-6 backdrop-blur-xl bg-gradient-to-r from-slate-900/60 to-slate-800/40 rounded-2xl border border-slate-700/30 shadow-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by code or name..."
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Code</label>
                <input
                  type="text"
                  name="code"
                  value={filters.code}
                  onChange={handleFilterChange}
                  placeholder="Filter by code..."
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  placeholder="Filter by name..."
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent backdrop-blur-sm"
                />
              </div>
              <div className="flex items-end space-x-4">
                <button
                  onClick={applyFilters}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-semibold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 text-slate-300 font-semibold rounded-xl border border-slate-600/50 hover:border-slate-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 px-4 py-2 bg-slate-900/60 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">Total: <span className="text-amber-300 font-semibold">{pagination.total}</span> records</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-slate-900/60 rounded-lg border border-slate-700/50 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-300">Page <span className="text-amber-300 font-semibold">{pagination.page}</span> of <span className="text-amber-300 font-semibold">{pagination.totalPages}</span></span>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={includeDeleted}
                      onChange={(e) => setIncludeDeleted(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${includeDeleted ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-slate-700'}`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${includeDeleted ? 'translate-x-6' : ''}`}></div>
                    </div>
                  </div>
                  <span className="text-slate-300 text-sm">Show Deleted</span>
                </label>
              </div>

              {permissions.create_role && (
                <button
                  onClick={() => router.push('/AddRolePage')}
                  className="group relative px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-semibold rounded-full shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Add Role</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(pagination.limit)].map((_, i) => (
                <div key={i} className="backdrop-blur-xl bg-gradient-to-r from-slate-900/60 to-slate-800/40 rounded-2xl border border-slate-700/30 shadow-xl p-6 animate-pulse">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-2 h-6 bg-slate-700/50 rounded-lg"></div>
                    <div className="col-span-2 h-6 bg-slate-700/50 rounded-lg"></div>
                    <div className="col-span-3 h-6 bg-slate-700/50 rounded-lg"></div>
                    <div className="col-span-2 h-6 bg-slate-700/50 rounded-lg"></div>
                    <div className="col-span-2 h-6 bg-slate-700/50 rounded-lg"></div>
                    <div className="col-span-1 h-6 bg-slate-700/50 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Luxury Table Container */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 rounded-2xl border border-amber-400/20 shadow-2xl shadow-amber-500/10 overflow-hidden">
                
                {/* Table Header */}
                <div className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 border-b border-amber-400/20">
                  <div className="grid grid-cols-12 gap-4 px-8 py-4">
                    <div className="col-span-2 font-semibold text-amber-300 text-sm uppercase tracking-wider">Code</div>
                    <div className="col-span-2 font-semibold text-amber-300 text-sm uppercase tracking-wider">Name</div>
                    <div className="col-span-3 font-semibold text-amber-300 text-sm uppercase tracking-wider">Description</div>
                    <div className="col-span-2 font-semibold text-amber-300 text-sm uppercase tracking-wider">Permissions</div>
                    <div className="col-span-2 font-semibold text-amber-300 text-sm uppercase tracking-wider">Status</div>
                    <div className="col-span-1 font-semibold text-amber-300 text-sm uppercase tracking-wider text-right">Actions</div>
                  </div>
                </div>

                {/* Data Rows */}
                <div className="divide-y divide-slate-700/30">
                  {rolesList.length > 0 ? (
                    rolesList.map((role, index) => (
                      <div 
                        key={role.id} 
                        className={`grid grid-cols-12 gap-4 items-center px-8 py-6 hover:bg-gradient-to-r hover:from-amber-500/5 hover:to-yellow-500/5 transition-all duration-300 group ${
                          index % 2 === 0 ? 'bg-slate-900/20' : 'bg-slate-800/20'
                        }`}
                      >
                        <div className="col-span-2">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border backdrop-blur-sm ${
                            role.deleted 
                              ? 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border-red-500/30'
                              : 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/30'
                          }`}>
                            {role.code || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="col-span-2">
                          <span className="text-amber-100 font-medium group-hover:text-amber-200 transition-colors">
                            {role.name}
                          </span>
                        </div>
                        
                        <div className="col-span-3">
                          <div className="max-w-xs">
                            <p className="text-slate-300 text-sm truncate group-hover:text-slate-200 transition-colors" title={role.description}>
                              {role.description || 'No description'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          {renderPermissions(role.permissions)}
                        </div>
                        
                        <div className="col-span-2">
                          {role.deleted ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border border-red-500/30 backdrop-blur-sm">
                              <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                              Deleted
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30 backdrop-blur-sm">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                              Active
                            </span>
                          )}
                        </div>
                        
                        <div className="col-span-1 flex justify-end space-x-2">
                          {permissions.update_role && (
                            <>
                              {role.deleted ? (
                                <button 
                                  onClick={() => restoreRole(role.id)}
                                  className="group/btn p-2.5 text-slate-400 hover:text-green-300 bg-slate-800/30 hover:bg-green-500/20 rounded-xl border border-slate-700/50 hover:border-green-400/50 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                                  title="Restore Role"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover/btn:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              ) : (
                                <button 
                                  onClick={() => updateRole(role.id)}
                                  className="group/btn p-2.5 text-slate-400 hover:text-blue-300 bg-slate-800/30 hover:bg-blue-500/20 rounded-xl border border-slate-700/50 hover:border-blue-400/50 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                                  title="Edit Role"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover/btn:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                              )}
                            </>
                          )}
                          {permissions.delete_role && (
                            <>
                              {role.deleted ? (
                                <button 
                                  onClick={() => deleteRole(role.id, true)}
                                  className="group/btn p-2.5 text-slate-400 hover:text-rose-300 bg-slate-800/30 hover:bg-rose-500/20 rounded-xl border border-slate-700/50 hover:border-rose-400/50 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                                  title="Permanently Delete"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover/btn:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              ) : (
                                <button 
                                  onClick={() => deleteRole(role.id, false)}
                                  className="group/btn p-2.5 text-slate-400 hover:text-red-300 bg-slate-800/30 hover:bg-red-500/20 rounded-xl border border-slate-700/50 hover:border-red-400/50 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                                  title="Delete Role"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover/btn:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-400 text-lg">No roles found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Premium Pagination */}
              {rolesList.length > 0 && (
                <div className="flex items-center justify-between mt-8 px-2">
                  <div className="flex items-center space-x-4">
                    <div className="px-6 py-3 bg-gradient-to-r from-slate-900/80 to-slate-800/60 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                      <span className="text-slate-400 text-sm">
                        Showing <span className="font-semibold text-amber-300">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                        <span className="font-semibold text-amber-300">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{' '}
                        of <span className="font-semibold text-amber-300">{pagination.total}</span> results
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        pagination.page === 1 
                          ? 'text-slate-600 bg-slate-800/30 border border-slate-700/30 cursor-not-allowed' 
                          : 'text-slate-300 bg-gradient-to-r from-slate-900/80 to-slate-800/60 border border-slate-700/50 hover:from-amber-500/20 hover:to-yellow-500/20 hover:border-amber-400/50 hover:text-amber-200 hover:scale-105 backdrop-blur-sm'
                      }`}
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
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
                            className={`w-12 h-12 rounded-xl font-semibold transition-all duration-300 ${
                              pagination.page === pageNum 
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 shadow-lg shadow-amber-500/30 scale-110' 
                                : 'text-slate-300 bg-gradient-to-r from-slate-900/80 to-slate-800/60 border border-slate-700/50 hover:from-amber-500/20 hover:to-yellow-500/20 hover:border-amber-400/50 hover:text-amber-200 hover:scale-105 backdrop-blur-sm'
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
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        pagination.page === pagination.totalPages 
                          ? 'text-slate-600 bg-slate-800/30 border border-slate-700/30 cursor-not-allowed' 
                          : 'text-slate-300 bg-gradient-to-r from-slate-900/80 to-slate-800/60 border border-slate-700/50 hover:from-amber-500/20 hover:to-yellow-500/20 hover:border-amber-400/50 hover:text-amber-200 hover:scale-105 backdrop-blur-sm'
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
      </div>
      <Toaster />
    </div>
  );
};

export default RolesCom;