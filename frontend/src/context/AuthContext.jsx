import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem('token');
      const storedRole = sessionStorage.getItem('role');
      const adminAuth = sessionStorage.getItem('adminAuth') === 'true';
      
      if (adminAuth) setIsAdmin(true);

      if (token && storedRole) {
        setRole(storedRole);
        try {
          let endpoint = '/patient/profile';
          if (storedRole === 'hospital' || storedRole === 'hospital_admin') {
            endpoint = '/hospital/profile';
          } else if (storedRole === 'doctor') {
            endpoint = '/doctor/profile';
          }
          const res = await api.get(endpoint);
          setUser(res.data);
        } catch (error) {
          console.error('Auth check failed', error);
          // If token is invalid, clear everything
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (userData, tokenString, userRole) => {
    sessionStorage.setItem('token', tokenString);
    sessionStorage.setItem('role', userRole);
    setUser(userData);
    setRole(userRole);
  };

  const adminLogin = (tokenString) => {
    sessionStorage.setItem('adminAuth', 'true');
    sessionStorage.setItem('adminToken', tokenString);
    setIsAdmin(true);
  };

  const logout = () => {
    // Clear ALL possible auth keys
    const keysToRemove = ['token', 'role', 'adminAuth', 'adminToken', 'adminAuthStatus'];
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    setUser(null);
    setRole(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, role, isAdmin, login, adminLogin, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
