'use client';
import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from '@/components/AxiosInstance';
import { AuthContext } from '@/components/AuthContext';
import { ArrowLeft, Save, Upload, ImageIcon, AlertCircle, Eye, X } from 'lucide-react';

const AddImagesPage = () => {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  
  const permissions = authContext?.permissions || {};
  const hasCreatePermission = permissions?.create_image || permissions?.CREATE_IMAGE || false;
  const hasReadCategoryPermission = permissions?.read_image_category || permissions?.READ_IMAGE_CATEGORY || false;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    file: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    if (hasReadCategoryPermission) {
      fetchCategories();
    } else {
      setIsLoadingCategories(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasReadCategoryPermission]);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      // Get all categories (no pagination needed for dropdown)
      const res = await AxiosInstance.get('/api/categories/v1/category/?skip=0&limit=1000');
      
      if (res.data && res.data.result && res.data.result.data) {
        setCategories(res.data.result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        file: 'Only JPEG, PNG, GIF, and WebP images are allowed'
      }));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        file: 'File size must be less than 5MB'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      file: file
    }));

    // Clear error
    if (errors.file) {
      setErrors(prev => ({
        ...prev,
        file: ''
      }));
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setFormData(prev => ({
      ...prev,
      file: null
    }));
    setPreviewUrl(null);
    // Clear file input
    const fileInput = document.getElementById('file');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.file) {
      newErrors.file = 'Image file is required';
    }

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Image name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Image name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasCreatePermission) {
      toast.error('You do not have permission to create images');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for multipart/form-data upload
      const uploadData = new FormData();
      
      // Add file (required)
      uploadData.append('file', formData.file);
      
      // Add optional fields only if they have values
      if (formData.name && formData.name.trim()) {
        uploadData.append('name', formData.name.trim());
      }
      
      if (formData.description && formData.description.trim()) {
        uploadData.append('description', formData.description.trim());
      }
      
      if (formData.category_id) {
        uploadData.append('category_id', formData.category_id);
      }

      console.log('Uploading image...');

      // POST to /api/images/v1/image/ with multipart/form-data
      const response = await AxiosInstance.post('/api/images/v1/image/', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);

      // Backend returns the created image object (status 201)
      if (response.status === 201 || response.data) {
        toast.success('Image uploaded successfully!');
        
        // Redirect to images list after a short delay
        setTimeout(() => {
          router.push('/imagespage');
        }, 1500);
      } else {
        toast.error('Failed to upload image');
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        router.push('/login');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to upload images');
      } else if (error.response?.status === 400) {
        const errorDetail = error.response?.data?.detail || 'Invalid data provided';
        toast.error(errorDetail);
      } else if (error.response?.status === 404) {
        toast.error('Category not found. Please select a valid category.');
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
        toast.error(error.response?.data?.detail || error.message || 'Error uploading image');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/imagespage');
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
            You don't have permission to upload images. Please contact your administrator.
          </p>
          <p className="text-xs text-slate-500 mb-6">
            Required permission: create_image
          </p>
          <button 
            onClick={() => router.push('/imagespage')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
          >
            Back to Images
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

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Images</span>
          </button>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-blue-500/10 rounded-2xl flex items-center justify-center border-2 border-blue-500/30">
              <ImageIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Upload New Image
              </h1>
              <p className="text-slate-400 text-sm mt-1">Add a new image to your gallery</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-2 border-slate-700/30 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-8">
          {/* Luxury border frame */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none">
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-blue-400/40 rounded-tl-3xl"></div>
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-blue-400/40 rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-blue-400/40 rounded-bl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-blue-400/40 rounded-br-3xl"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* File Upload Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Image File <span className="text-red-400">*</span>
              </label>
              
              {!previewUrl ? (
                <div className="relative">
                  <input
                    type="file"
                    id="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="file"
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed ${
                      errors.file 
                        ? 'border-red-500/50 bg-red-500/5' 
                        : 'border-slate-700/50 bg-slate-900/30 hover:border-blue-500/50 hover:bg-slate-800/30'
                    } rounded-xl cursor-pointer transition-all`}
                  >
                    <Upload className={`w-12 h-12 mb-4 ${errors.file ? 'text-red-400' : 'text-slate-400'}`} />
                    <p className="text-slate-300 font-medium mb-2">Click to upload image</p>
                    <p className="text-slate-500 text-sm">JPEG, PNG, GIF, WebP (Max 5MB)</p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative w-full h-64 bg-slate-900/50 rounded-xl overflow-hidden border-2 border-slate-700/50">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-500 text-white rounded-full transition-colors"
                    title="Remove image"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              {errors.file && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.file}</span>
                </div>
              )}
              <p className="text-slate-500 text-xs mt-2">
                Supported formats: JPEG, PNG, GIF, WebP • Maximum file size: 5MB
              </p>
            </div>

            {/* Image Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-300 mb-3">
                Image Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Summer Beach Sunset"
                className={`w-full px-4 py-4 bg-slate-900/50 text-white border ${
                  errors.name 
                    ? 'border-red-500/50 focus:ring-red-500/50' 
                    : 'border-slate-700/50 focus:ring-blue-500/50 focus:border-blue-500/50'
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

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-300 mb-3">
                Description <span className="text-slate-500">(Optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your image..."
                className="w-full px-4 py-4 bg-slate-900/50 text-white border border-slate-700/50 focus:ring-blue-500/50 focus:border-blue-500/50 rounded-xl focus:outline-none focus:ring-2 transition-all placeholder:text-slate-500 resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Category Field */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-semibold text-slate-300 mb-3">
                Category <span className="text-slate-500">(Optional)</span>
              </label>
              {isLoadingCategories ? (
                <div className="flex items-center gap-2 px-4 py-4 bg-slate-900/50 border border-slate-700/50 rounded-xl">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-slate-400 text-sm">Loading categories...</span>
                </div>
              ) : (
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-slate-900/50 text-white border border-slate-700/50 focus:ring-blue-500/50 focus:border-blue-500/50 rounded-xl focus:outline-none focus:ring-2 transition-all cursor-pointer"
                  disabled={isSubmitting}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.category}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-slate-500 text-xs mt-2">
                Assign this image to a category for better organization
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-300 text-sm font-medium mb-1">Upload Guidelines</p>
                  <ul className="text-slate-400 text-xs space-y-1">
                    <li>• Use high-quality images for best results</li>
                    <li>• Give your images descriptive names</li>
                    <li>• Add detailed descriptions for better searchability</li>
                    <li>• Organize images using categories</li>
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
                disabled={isSubmitting || !formData.file}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-500 hover:via-blue-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_30px_rgba(59,130,246,0.6)] transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-400/30"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload Image</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddImagesPage;