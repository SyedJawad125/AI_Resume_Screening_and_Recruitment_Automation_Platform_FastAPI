// import axios from 'axios';

// // Create an Axios instance
// const axiosInstance = axios.create({
//   baseURL: 'http://localhost:8000', 
// });

// // Add a request interceptor
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Get the user from localStorage
//     const token = JSON.parse(localStorage.getItem('token'));
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;



// import axios from 'axios';

// // Create an Axios instance
// const axiosInstance = axios.create({
//   baseURL: 'http://localhost:8000', 
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add a request interceptor
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Get the access token from localStorage
//     const token = localStorage.getItem('access_token');
    
//     if (token) {
//       // Add Bearer token to Authorization header
//       config.headers.Authorization = `Bearer ${token}`;
//       console.log('Request interceptor: Token attached to request');
//     } else {
//       console.log('Request interceptor: No token found');
//     }
    
//     return config;
//   },
//   (error) => {
//     console.error('Request interceptor error:', error);
//     return Promise.reject(error);
//   }
// );

// // Add a response interceptor to handle token refresh
// axiosInstance.interceptors.response.use(
//   (response) => {
//     // If response is successful, just return it
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;

//     // If error is 401 (Unauthorized) and we haven't tried to refresh yet
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         console.log('Token expired, attempting to refresh...');
        
//         // Get refresh token
//         const refreshToken = localStorage.getItem('refresh_token');
        
//         if (!refreshToken) {
//           console.error('No refresh token found');
//           throw new Error('No refresh token available');
//         }

//         // Call refresh token endpoint
//         const response = await axios.post('http://localhost:8000/token/refresh/', {
//           refresh: refreshToken
//         });

//         const newAccessToken = response.data.access;
        
//         // Store new access token
//         localStorage.setItem('access_token', newAccessToken);
        
//         console.log('Token refreshed successfully');

//         // Update the failed request with new token
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
//         // Retry the original request
//         return axiosInstance(originalRequest);
        
//       } catch (refreshError) {
//         console.error('Token refresh failed:', refreshError);
        
//         // Clear all auth data
//         localStorage.removeItem('access_token');
//         localStorage.removeItem('refresh_token');
//         localStorage.removeItem('permissions');
//         localStorage.removeItem('role');
//         localStorage.removeItem('user');
        
//         // Redirect to login page
//         if (typeof window !== 'undefined') {
//           window.location.href = '/login';
//         }
        
//         return Promise.reject(refreshError);
//       }
//     }

//     // For other errors, just reject
//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;



import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the access token from localStorage
    const token = localStorage.getItem('access_token');
    
    if (token) {
      // Add Bearer token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request interceptor: Token attached to request');
    } else {
      console.log('Request interceptor: No token found');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('Token expired, attempting to refresh...');
        
        // Get refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          console.error('No refresh token found');
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint - CORRECTED TO MATCH BACKEND
        const response = await axios.post('http://localhost:8000/api/user/v1/refresh/', {
          refresh_token: refreshToken  // Backend expects 'refresh_token', not 'refresh'
        });

        // Backend returns tokens in data.data structure
        const newAccessToken = response.data.data.access_token;
        const newRefreshToken = response.data.data.refresh_token;
        
        // Store new tokens
        localStorage.setItem('access_token', newAccessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
        
        console.log('Token refreshed successfully');

        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Retry the original request
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear all auth data
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('permissions');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default axiosInstance;