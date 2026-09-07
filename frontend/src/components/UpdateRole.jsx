'use client';
import React, { useState, useContext, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from '@/components/AxiosInstance';
import { AuthContext } from '@/components/AuthContext';
import { ArrowLeft, Save, Shield, AlertCircle, Eye, Search, X } from 'lucide-react';

const UpdateRolePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleId = searchParams.get('id');
  
  const authContext = useContext(AuthContext);
  
  const permissions = authContext?.permissions || {};
  const hasUpdatePermission = permissions?.update_role || false;
  const hasReadPermission = permissions?.read_role || false;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: ''
  });
  const [originalData, setOriginalData] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [originalPermissions, setOriginalPermissions] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  // Fetch all available permissions
  useEffect(() => {
    if (hasReadPermission) {
      fetchAllPermissions();
    }
  }, [hasReadPermission]);

  // Fetch role data
  useEffect(() => {
    if (roleId && hasReadPermission) {
      fetchRole();
    } else if (!roleId) {
      toast.error('Role ID is required');
      router.push('/Roles');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId, hasReadPermission]);

  // Filter permissions based on search
  useEffect(() => {
    if (permissionSearch.trim() === '') {
      setFilteredPermissions(availablePermissions);
    } else {
      const searchLower = permissionSearch.toLowerCase();
      const filtered = availablePermissions.filter(perm => 
        perm.name.toLowerCase().includes(searchLower) ||
        perm.code.toLowerCase().includes(searchLower) ||
        (perm.module_name && perm.module_name.toLowerCase().includes(searchLower))
      );
      setFilteredPermissions(filtered);
    }
  }, [permissionSearch, availablePermissions]);

  const fetchAllPermissions = async () => {
    setIsLoadingPermissions(true);
    try {
      const response = await AxiosInstance.get('/api/permissions/v1/permission/', {
        params: {
          skip: 0,
          limit: 1000, // Fetch all permissions
          include_deleted: false
        }
      });
      
      if (response.data.status === 'success') {
        const perms = response.data.result.data || [];
        setAvailablePermissions(perms);
        setFilteredPermissions(perms);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Error loading permissions');
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const fetchRole = async () => {
    setIsLoading(true);
    
    try {
      // GET /api/roles/v1/role/{id}
      const response = await AxiosInstance.get(`/api/roles/v1/role/${roleId}`);
      
      console.log('Fetch role response:', response.data);
      
      // Backend returns the role object directly
      const roleData = response.data;
      
      if (roleData) {
        setOriginalData(roleData);
        setFormData({
          code: roleData.code || '',
          name: roleData.name || '',
          description: roleData.description || ''
        });

        // Handle permissions - they might be objects or IDs
        let rolePermissions = [];
        if (roleData.permissions && Array.isArray(roleData.permissions)) {
          if (roleData.permissions.length > 0 && typeof roleData.permissions[0] === 'object') {
            // Permissions are already objects
            rolePermissions = roleData.permissions;
          } else {
            // Permissions are IDs, we'll map them after availablePermissions loads
            rolePermissions = roleData.permissions.map(permId => ({ id: permId }));
          }
        }
        
        setSelectedPermissions(rolePermissions);
        setOriginalPermissions(rolePermissions);
      } else {
        toast.error('Failed to load role data');
        router.push('/Roles');
      }
      
    } catch (error) {
      console.error('Error fetching role:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to view this role');
        router.push('/Roles');
      } else if (error.response?.status === 404) {
        toast.error('Role not found');
        router.push('/Roles');
      } else {
        toast.error(error.response?.data?.detail || 'Error loading role');
        router.push('/Roles');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Map permission IDs to full objects once availablePermissions loads
  useEffect(() => {
    if (availablePermissions.length > 0 && selectedPermissions.length > 0) {
      const mappedPermissions = selectedPermissions.map(selectedPerm => {
        // If it's already a full object with name, keep it
        if (selectedPerm.name) return selectedPerm;
        
        // Otherwise find it in availablePermissions
        const found = availablePermissions.find(p => p.id === selectedPerm.id);
        return found || selectedPerm;
      });
      
      setSelectedPermissions(mappedPermissions);
      setOriginalPermissions(mappedPermissions);
    }
  }, [availablePermissions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePermission = (permission) => {
    setSelectedPermissions(prev => {
      const isSelected = prev.some(p => p.id === permission.id);
      if (isSelected) {
        return prev.filter(p => p.id !== permission.id);
      } else {
        return [...prev, permission];
      }
    });
  };

  const selectAllPermissions = () => {
    setSelectedPermissions([...filteredPermissions]);
  };

  const deselectAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate code (required, lowercase with underscores)
    if (!formData.code.trim()) {
      newErrors.code = 'Role code is required';
    } else if (!/^[a-z_]+$/.test(formData.code.trim())) {
      newErrors.code = 'Code must be lowercase letters and underscores only';
    } else if (formData.code.trim().length < 3) {
      newErrors.code = 'Code must be at least 3 characters';
    } else if (formData.code.trim().length > 50) {
      newErrors.code = 'Code must not exceed 50 characters';
    }

    // Validate name (required)
    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must not exceed 100 characters';
    }

    // Validate description (optional but if provided, must be valid)
    if (formData.description.trim() && formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters if provided';
    } else if (formData.description.trim().length > 255) {
      newErrors.description = 'Description must not exceed 255 characters';
    }

    // Validate permissions
    if (selectedPermissions.length === 0) {
      newErrors.permissions = 'Please select at least one permission';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    if (!originalData) return false;
    
    // Check form fields
    const formChanged = (
      formData.code.trim() !== (originalData.code || '') ||
      formData.name.trim() !== (originalData.name || '') ||
      formData.description.trim() !== (originalData.description || '')
    );

    // Check permissions
    const selectedIds = selectedPermissions.map(p => p.id).sort();
    const originalIds = originalPermissions.map(p => p.id).sort();
    const permissionsChanged = JSON.stringify(selectedIds) !== JSON.stringify(originalIds);

    return formChanged || permissionsChanged;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasUpdatePermission) {
      toast.error('You do not have permission to update roles');
      return;
    }

    // Check if data has changed
    if (!hasChanges()) {
      toast.info('No changes detected');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload - backend expects permission IDs
      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        permission_ids: selectedPermissions.map(p => p.id)
      };

      console.log('Updating role:', payload);

      // PATCH /api/roles/v1/role/{id}
      const response = await AxiosInstance.patch(
        `/api/roles/v1/role/${roleId}`,
        payload
      );

      console.log('Update response:', response.data);

      // Backend returns the updated role object
      if (response.status === 200 || response.data) {
        toast.success('Role updated successfully!');
        
        // Redirect to roles list after a short delay
        setTimeout(() => {
          router.push('/Roles');
        }, 1500);
      } else {
        toast.error('Failed to update role');
      }

    } catch (error) {
      console.error('Error updating role:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to update roles');
      } else if (error.response?.status === 404) {
        toast.error('Role not found');
        router.push('/Roles');
      } else if (error.response?.status === 400) {
        const errorDetail = error.response?.data?.detail || 'Invalid data provided';
        toast.error(errorDetail);
      } else if (error.response?.status === 422) {
        // Validation error from FastAPI
        const validationErrors = error.response?.data?.detail;
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach(err => {
            toast.error(`${err.loc[err.loc.length - 1]}: ${err.msg}`);
          });
        } else {
          toast.error('Validation error. Please check your input.');
        }
      } else {
        toast.error(error.response?.data?.detail || error.message || 'Error updating role');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/Roles');
  };

  // Check if AuthContext is still loading
  if (!authContext) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-yellow-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="mt-6 text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Access denied screen
  if (!hasUpdatePermission) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-slate-400 mb-6">
            You don't have permission to update roles. Please contact your administrator.
          </p>
          <p className="text-xs text-slate-500 mb-6">
            Required permission: update_role
          </p>
          <button 
            onClick={() => router.push('/Roles')}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-900 rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all duration-200 hover:scale-105"
          >
            Back to Roles
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

  // Loading state while fetching role
  if (isLoading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-yellow-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="mt-6 text-slate-400 font-medium">Loading role data...</p>
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
    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6 overflow-auto">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="dark"
        className="mt-16"
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Roles</span>
          </button>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-600/20 to-amber-500/10 rounded-2xl flex items-center justify-center border-2 border-orange-500/30">
              <Shield className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                Update Role
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Edit role: <span className="text-white font-medium">{originalData?.name}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-2 border-slate-700/30 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8">
              {/* Luxury border frame */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-orange-400/40 rounded-tl-3xl"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-orange-400/40 rounded-tr-3xl"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-orange-400/40 rounded-bl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-orange-400/40 rounded-br-3xl"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {/* Role Code Field */}
                <div>
                  <label 
                    htmlFor="code" 
                    className="block text-sm font-semibold text-slate-300 mb-3"
                  >
                    Role Code <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g., admin, manager, editor"
                      className={`w-full px-4 py-4 bg-slate-900/50 text-white border ${
                        errors.code 
                          ? 'border-red-500/50 focus:ring-red-500/50' 
                          : 'border-slate-700/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                      } rounded-xl focus:outline-none focus:ring-2 transition-all placeholder:text-slate-500`}
                      disabled={isSubmitting}
                    />
                    {errors.code && (
                      <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.code}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    Unique identifier using lowercase letters and underscores
                  </p>
                </div>

                {/* Role Name Field */}
                <div>
                  <label 
                    htmlFor="name" 
                    className="block text-sm font-semibold text-slate-300 mb-3"
                  >
                    Role Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Administrator, Content Manager, Editor"
                      className={`w-full px-4 py-4 bg-slate-900/50 text-white border ${
                        errors.name 
                          ? 'border-red-500/50 focus:ring-red-500/50' 
                          : 'border-slate-700/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                      } rounded-xl focus:outline-none focus:ring-2 transition-all placeholder:text-slate-500`}
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.name}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    Human-readable name for the role (3-100 characters)
                  </p>
                </div>

                {/* Description Field */}
                <div>
                  <label 
                    htmlFor="description" 
                    className="block text-sm font-semibold text-slate-300 mb-3"
                  >
                    Description
                  </label>
                  <div className="relative">
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="e.g., Full system access with all administrative privileges"
                      rows={3}
                      className={`w-full px-4 py-4 bg-slate-900/50 text-white border ${
                        errors.description 
                          ? 'border-red-500/50 focus:ring-red-500/50' 
                          : 'border-slate-700/50 focus:ring-orange-500/50 focus:border-orange-500/50'
                      } rounded-xl focus:outline-none focus:ring-2 transition-all placeholder:text-slate-500 resize-none`}
                      disabled={isSubmitting}
                    />
                    {errors.description && (
                      <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.description}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    Optional description of what this role represents
                  </p>
                </div>

                {/* Role Info */}
                {originalData && (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-2">
                    <h3 className="text-sm font-semibold text-slate-300 mb-3">Role Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Role ID</p>
                        <p className="text-white font-medium">#{originalData.id}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Created At</p>
                        <p className="text-white font-medium">
                          {new Date(originalData.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning Box */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-300 text-sm font-medium mb-1">Important Notes</p>
                      <ul className="text-slate-400 text-xs space-y-1">
                        <li>• Updating this role will affect all users assigned to it</li>
                        <li>• Permission changes will be applied immediately</li>
                        <li>• Changes will be visible immediately after saving</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-slate-700/50">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-4 bg-slate-800/50 hover:bg-slate-700/50 text-white font-semibold rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !hasChanges()}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-600 hover:from-orange-500 hover:via-amber-400 hover:to-yellow-500 text-slate-900 font-bold rounded-xl shadow-[0_4px_20px_rgba(251,146,60,0.4)] hover:shadow-[0_6px_30px_rgba(251,146,60,0.6)] transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-orange-400/30"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Update Role</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Permissions Selector */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-2 border-slate-700/30 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-amber-300">Permissions</h3>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm font-semibold border border-amber-400/30">
                    {selectedPermissions.length} selected
                  </span>
                </div>

                {errors.permissions && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.permissions}</span>
                  </div>
                )}

                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                      placeholder="Search permissions..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent text-sm"
                    />
                    {permissionSearch && (
                      <button
                        onClick={() => setPermissionSearch('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Bulk Actions */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={selectAllPermissions}
                    className="flex-1 px-3 py-2 bg-green-500/10 text-green-300 rounded-lg text-xs font-medium border border-green-500/30 hover:bg-green-500/20 transition-all"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllPermissions}
                    className="flex-1 px-3 py-2 bg-red-500/10 text-red-300 rounded-lg text-xs font-medium border border-red-500/30 hover:bg-red-500/20 transition-all"
                  >
                    Deselect All
                  </button>
                </div>

                {/* Permissions List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {isLoadingPermissions ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-slate-700 border-t-amber-500 rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-slate-500 text-sm">Loading permissions...</p>
                    </div>
                  ) : filteredPermissions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500 text-sm">No permissions found</p>
                    </div>
                  ) : (
                    filteredPermissions.map(permission => {
                      const isSelected = selectedPermissions.some(p => p.id === permission.id);
                      return (
                        <label
                          key={permission.id}
                          className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-400/30 hover:bg-amber-500/15'
                              : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePermission(permission)}
                            className="mt-1 w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-500/50 focus:ring-offset-0 bg-slate-900"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-200 text-sm truncate">
                              {permission.name}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {permission.code}
                            </div>
                            {permission.module_name && (
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                  {permission.module_name}
                                </span>
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips Card */}
        <div className="mt-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-400" />
            Update Tips
          </h3>
          <div className="space-y-2 text-slate-400 text-sm">
            <p>✓ The role will be updated for all assigned users</p>
            <p>✓ Permission changes take effect immediately</p>
            <p>✓ You can revert changes by canceling before saving</p>
            <p>✓ Original creation information is preserved</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.5);
        }
      `}</style>
    </div>
  );
};

export default UpdateRolePage;