import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { ENDPOINTS } from '../api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await api.get(ENDPOINTS.USER.PROFILE);
      if (response.data && response.data.data) {
        const profileData = response.data.data;
        setUser({
          id: profileData.id,
          username: profileData.username,
          firstName: profileData.firstname || "", // backend is 'firstname'
          lastName: profileData.lastname || "",   // backend is 'lastname'
          lineId: profileData.lineId || "",
          houseNo: profileData.houseNo || "",
          mobileNo: profileData.mobileNo || "",
          status: profileData.status,
          role: profileData.role || "user"
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // If unauthorized/error, we might want to clear user/tokens
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setLoading(true);
    await fetchProfile();
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
