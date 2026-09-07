'use client';
import React, { createContext, useState, useEffect } from 'react';
import AxiosInstance from "@/components/AxiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  console.log('AuthProvider is rendered');

  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage on mount
    const storedToken = localStorage.getItem('access_token');
    const storedRefreshToken = localStorage.getItem('refresh_token');
    const storedPermissions = localStorage.getItem('permissions');
    const storedRole = localStorage.getItem('role');
    const storedUser = localStorage.getItem('user');

    console.log('Loading auth data from localStorage...');
    console.log('Stored token:', storedToken);
    console.log('Stored permissions:', storedPermissions);
    console.log('Stored role:', storedRole);
    console.log('Stored user:', storedUser);

    if (storedToken) {
      setToken(storedToken);
      console.log('Loaded access token');
    }

    if (storedRefreshToken) {
      setRefreshToken(storedRefreshToken);
    }

    if (storedPermissions) {
      try {
        const parsedPermissions = JSON.parse(storedPermissions);
        if (typeof parsedPermissions === 'object' && parsedPermissions !== null) {
          setPermissions(parsedPermissions);
          console.log('Loaded permissions object:', parsedPermissions);
        } else if (Array.isArray(parsedPermissions)) {
          const permissionsObj = {};
          parsedPermissions.forEach(perm => {
            permissionsObj[perm] = true;
          });
          setPermissions(permissionsObj);
          console.log('Converted permissions array to object:', permissionsObj);
        }
      } catch (error) {
        console.error('Error parsing permissions:', error);
        setPermissions({});
      }
    }

    if (storedRole) {
      try {
        const parsedRole = JSON.parse(storedRole);
        setRole(parsedRole);
        console.log('Loaded role:', parsedRole);
      } catch (error) {
        console.error('Error parsing role:', error);
        setRole(null);
      }
    }

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('Loaded user:', parsedUser);
      } catch (error) {
        console.error('Error parsing user:', error);
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  const login = (apiResponse) => {
    console.log('Login function called with response:', apiResponse);
    
    // FastAPI backend returns data directly (not wrapped in .data)
    const responseData = apiResponse;
    
    if (!responseData) {
      console.error('No data in API response');
      return;
    }

    // Extract tokens
    const accessToken = responseData.access_token;
    const refreshTokenValue = responseData.refresh_token;
    
    // Extract user data from nested user object
    const userFromResponse = responseData.user;
    if (!userFromResponse) {
      console.error('No user data in response');
      return;
    }

    // Extract permissions (at top level of response)
    const userPermissions = responseData.permissions || {};
    
    // Build user data object
    const userData = {
      id: userFromResponse.id,
      username: userFromResponse.username,
      email: userFromResponse.email,
      is_superuser: userFromResponse.is_superuser || false,
      role_id: userFromResponse.role_id,
      role_name: userFromResponse.role_name,
      permissions: userPermissions
    };

    // Build role object
    const roleObject = {
      id: userFromResponse.role_id,
      name: userFromResponse.role_name
    };

    if (!accessToken || !refreshTokenValue) {
      console.error('Missing tokens in response:', { accessToken, refreshTokenValue });
      return;
    }

    // Store in localStorage
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshTokenValue);
    localStorage.setItem('permissions', JSON.stringify(userPermissions));
    localStorage.setItem('role', JSON.stringify(roleObject));
    localStorage.setItem('user', JSON.stringify(userData));

    // Update state
    setToken(accessToken);
    setRefreshToken(refreshTokenValue);
    setPermissions(userPermissions);
    setRole(roleObject);
    setUser(userData);

    console.log('Login successful - Data stored:', {
      token: accessToken ? 'Present' : 'Missing',
      permissionsCount: Object.keys(userPermissions).length,
      role: roleObject,
      user: userData
    });
  };

  const logout = async () => {
    console.log('Logout function called');
    
    try {
      // Optional: Call backend logout API if you have one
      // await AxiosInstance.post('/api/logout', { refresh_token: refreshToken });
      
      // Clear localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('permissions');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      
      console.log('Cleared localStorage');

      // Clear state
      setToken(null);
      setRefreshToken(null);
      setPermissions({});
      setRole(null);
      setUser(null);

      console.log('Logout successful - State cleared');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local data
      localStorage.clear();
      setToken(null);
      setRefreshToken(null);
      setPermissions({});
      setRole(null);
      setUser(null);
      return false;
    }
  };

  const hasPermission = (permission) => {
    const result = permissions[permission] === true;
    console.log(`Checking permission "${permission}":`, result, 'from permissions:', permissions);
    return result;
  };

  const hasAnyPermission = (permissionList) => {
    const result = permissionList.some(permission => permissions[permission] === true);
    console.log(`Checking any permission from [${permissionList.join(', ')}]:`, result);
    return result;
  };

  const hasAllPermissions = (permissionList) => {
    const result = permissionList.every(permission => permissions[permission] === true);
    console.log(`Checking all permissions from [${permissionList.join(', ')}]:`, result);
    return result;
  };

  const isAuthenticated = !!token;
  const isSuperuser = user?.is_superuser === true || role?.name === 'Super' || role?.name === 'Admin';

  const getPermissionKeys = () => {
    return Object.keys(permissions).filter(key => permissions[key] === true);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        refreshToken,
        permissions, 
        role, 
        user,
        loading,
        login, 
        logout,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        getPermissionKeys,
        isAuthenticated,
        isSuperuser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};