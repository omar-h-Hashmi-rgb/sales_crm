import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Verify token is still valid
        authAPI.getMe()
          .then((response) => {
            setUser(response.data.user);
          })
          .catch(() => {
            logout();
          });
      } catch (error) {
        logout();
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const canAssignLeads = () => {
    return user && [1, 2].includes(user.tier_level);
  };

  const canCreateLeads = () => {
    return user && [1, 2].includes(user.tier_level);
  };

  const canEditLead = (lead) => {
    if (!user) return false;
    
    // Admin and Area Manager can edit any lead
    if ([1, 2].includes(user.tier_level)) return true;
    
    // Others can only edit assigned leads that are not fresh
    return !lead.is_fresh && lead.assigned_to_user_id === user.id;
  };

  const canUpdateStatus = (lead) => {
    if (!user) return false;
    
    // Admin and Area Manager can update any lead
    if ([1, 2].includes(user.tier_level)) return true;
    
    // Others can only update assigned leads
    return lead.assigned_to_user_id === user.id;
  };

  const getTierName = (tierLevel) => {
    const tierNames = {
      1: 'Admin',
      2: 'Area Manager',
      3: 'Store Manager',
      4: 'Sales Rep'
    };
    return tierNames[tierLevel] || 'Unknown';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    canAssignLeads,
    canCreateLeads,
    canEditLead,
    canUpdateStatus,
    getTierName,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};