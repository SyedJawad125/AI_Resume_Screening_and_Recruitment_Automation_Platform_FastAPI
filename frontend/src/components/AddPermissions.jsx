'use client';
import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from '@/components/AxiosInstance';
import { AuthContext } from '@/components/AuthContext';
import { ArrowLeft, Save, Shield, AlertCircle, Eye } from 'lucide-react';

const AddPermissionPage = () => {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  
  const permissions = authContext?.permissions || {};
  const hasCreatePermission = permissions?.create_role || false;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    module_name: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validateForm = () => {
    const newErrors = {};

    // Validate code (required, lowercase with underscores)
    if (!formData.code.trim()) {
      newErrors.code = 'Permission code is required';
    } else if (!/^[a-z_]+$/.test(formData.code.trim())) {
      newErrors.code = 'Code must be lowercase letters and underscores only';
    } else if (formData.code.trim().length < 3) {
      newErrors.code = 'Code must be at least 3 characters';
    } else if (formData.code.trim().length > 50) {
      newErrors.code = 'Code must not exceed 50 characters';
    }

    // Validate name (required)
    if (!formData.name.trim()) {
      newErrors.name = 'Permission name is required';
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

    // Validate module_name (optional but if provided, must be valid)
    if (formData.module_name.trim() && formData.module_name.trim().length < 2) {
      newErrors.module_name = 'Module name must be at least 2 characters if provided';
    } else if (formData.module_name.trim().length > 50) {
      newErrors.module_name = 'Module name must not exceed 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasCreatePermission) {
      toast.error('You do not have permission to create permissions');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload matching backend PermissionCreate schema
      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        module_name: formData.module_name.trim() || null
      };

      console.log('Submitting permission:', payload);

      // POST to /api/permissions/v1/permission/
      const response = await AxiosInstance.post('/api/permissions/v1/permission/', payload);

      console.log('Create response:', response.data);

      // Backend returns 201 status with permission object
      if (response.status === 201 || response.data) {
        toast.success('Permission created successfully!');
        
        // Redirect to permissions list after a short delay
        setTimeout(() => {
          router.push('/PermissionsPage');
        }, 1500);
      } else {
        toast.error('Failed to create permission');
      }

    } catch (error) {
      console.error('Error creating permission:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to create permissions');
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
        toast.error(error.response?.data?.detail || error.message || 'Error creating permission');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/PermissionsPage');
  };

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
  if (!hasCreatePermission) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-slate-400 mb-6">
            You don't have permission to create permissions. Please contact your administrator.
          </p>
          <p className="text-xs text-slate-500 mb-6">
            Required permission: create_role
          </p>
          <button 
            onClick={() => router.push('/PermissionsPage')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
          >
            Back to Permissions
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

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Permissions</span>
          </button>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600/20 to-purple-500/10 rounded-2xl flex items-center justify-center border-2 border-purple-500/30">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Add New Permission
              </h1>
              <p className="text-slate-400 text-sm mt-1">Create a new permission for role-based access control</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-2 border-slate-700/30 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8">
          {/* Luxury border frame */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none">
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-purple-400/40 rounded-tl-3xl"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-purple-400/40 rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-purple-400/40 rounded-bl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-purple-400/40 rounded-br-3xl"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Permission Code Field */}
            <div>
              <label 
                htmlFor="code" 
                className="block text-sm font-semibold text-slate-300 mb-3"
              >
                Permission Code <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., show_role, create_user, delete_post"
                  className={`w-full px-4 py-4 bg-slate-900/50 text-white border ${
                    errors.code 
                      ? 'border-red-500/50 focus:ring-red-500/50' 
                      : 'border-slate-700/50 focus:ring-purple-500/50 focus:border-purple-500/50'
                  } rounded-xl focus:outline-none focus:ring-2 transition-all placeholder:text-slate-500`}
                  disabled={isSubmitting}
                  autoFocus
                />
                {errors.code && (
                  <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.code}</span>
                  </div>
                )}
              </div>
              <p className="text-slate-500 text-xs mt-2">
                Unique identifier using lowercase letters and underscores (e.g., read_user)
              </p>
            </div>

            {/* Permission Name Field */}
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-semibold text-slate-300 mb-3"
              >
                Permission Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Show Role, Create User, Delete Post"
                  className={`w-full px-4 py-4 bg-slate-900/50 text-white border ${
                    errors.name 
                      ? 'border-red-500/50 focus:ring-red-500/50' 
                      : 'border-slate-700/50 focus:ring-purple-500/50 focus:border-purple-500/50'
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
                Human-readable name for the permission (3-100 characters)
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
                  placeholder="e.g., User can view the list of roles"
                  rows={3}
                  className={`w-full px-4 py-4 bg-slate-900/50 text-white border ${
                    errors.description 
                      ? 'border-red-500/50 focus:ring-red-500/50' 
                      : 'border-slate-700/50 focus:ring-purple-500/50 focus:border-purple-500/50'
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
                Optional description of what this permission allows (max 255 characters)
              </p>
            </div>

            {/* Module Name Field */}
            <div>
              <label 
                htmlFor="module_name" 
                className="block text-sm font-semibold text-slate-300 mb-3"
              >
                Module Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="module_name"
                  name="module_name"
                  value={formData.module_name}
                  onChange={handleChange}
                  placeholder="e.g., Role, User, Post"
                  className={`w-full px-4 py-4 bg-slate-900/50 text-white border ${
                    errors.module_name 
                      ? 'border-red-500/50 focus:ring-red-500/50' 
                      : 'border-slate-700/50 focus:ring-purple-500/50 focus:border-purple-500/50'
                  } rounded-xl focus:outline-none focus:ring-2 transition-all placeholder:text-slate-500`}
                  disabled={isSubmitting}
                />
                {errors.module_name && (
                  <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.module_name}</span>
                  </div>
                )}
              </div>
              <p className="text-slate-500 text-xs mt-2">
                Optional module/feature this permission belongs to (e.g., Role, User)
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-300 text-sm font-medium mb-1">Permission Guidelines</p>
                  <ul className="text-slate-400 text-xs space-y-1">
                    <li>• Use descriptive, action-based names (show, create, read, update, delete)</li>
                    <li>• Code should be lowercase with underscores (snake_case)</li>
                    <li>• Group related permissions by module name</li>
                    <li>• Permissions control access to features and actions in the system</li>
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
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(168,85,247,0.4)] hover:shadow-[0_6px_30px_rgba(168,85,247,0.6)] transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-purple-400/30"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Create Permission</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Tips Card */}
        <div className="mt-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Quick Tips
          </h3>
          <div className="space-y-2 text-slate-400 text-sm">
            <p>✓ Permissions can be assigned to roles for granular access control</p>
            <p>✓ You can edit or delete permissions later if needed</p>
            <p>✓ Permissions assigned to active roles cannot be deleted</p>
            <p>✓ Use consistent naming conventions for easier management</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPermissionPage;