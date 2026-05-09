import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedRole = localStorage.getItem('role');
      if (token && storedRole) {
        setRole(storedRole);
        try {
          let endpoint = '/patient/profile';
          if (storedRole === 'hospital' || storedRole === 'hospital_admin') {
            endpoint = '/hospital/profile';
          } else if (storedRole === 'doctor') {
            endpoint = '/doctor/profile'; // Or whatever route we create for doctor profile
          }
          const res = await api.get(endpoint);
          setUser(res.data);

        } catch (error) {
          console.error('Auth check failed', error);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (userData, tokenString, userRole) => {
    localStorage.setItem('token', tokenString);
    localStorage.setItem('role', userRole);
    setUser(userData);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
