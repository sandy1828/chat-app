import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token exists on app load
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          // (Optional) Fetch user profile using token from backend
          // const res = await fetch("http://<your-ip>:3000/api/me", { headers: { Authorization: `Bearer ${storedToken}` }});
          // setUser(await res.json());
        }
      } catch (err) {
        console.error("Error loading token:", err);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  // Login function
  const loginUser = async (userData, jwtToken) => {
    try {
      setUser(userData);
      setToken(jwtToken);
      await AsyncStorage.setItem('token', jwtToken);
    } catch (err) {
      console.error("Error saving token:", err);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('token');
    } catch (err) {
      console.error("Error clearing token:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
