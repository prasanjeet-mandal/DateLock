import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing session on boot
  useEffect(() => {
    async function loadSession() {
      const token = localStorage.getItem('datelock_token');
      if (token) {
        try {
          const res = await authApi.getMe();
          setUser(res.data.user);
          setProfile(res.data.profile);
        } catch (err) {
          console.error('Session expired or invalid:', err);
          localStorage.removeItem('datelock_token');
          localStorage.removeItem('datelock_demo_user_id');
        }
      }
      setLoading(false);
    }
    loadSession();
  }, []);

  const login = async (email, password, adminSecurityKey = null) => {
    const res = await authApi.login(email, password, adminSecurityKey);
    const { token, user: loggedUser, profile: userProfile } = res.data;
    localStorage.setItem('datelock_token', token);
    localStorage.setItem('datelock_demo_user_id', loggedUser.id);
    setUser(loggedUser);
    setProfile(userProfile);
    return res.data;
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    const { token, user: newUser, profile: newProfile } = res.data;
    localStorage.setItem('datelock_token', token);
    localStorage.setItem('datelock_demo_user_id', newUser.id);
    setUser(newUser);
    setProfile(newProfile);
    return res.data;
  };

  const switchDemoPersona = async (role, studentIndex = 1, adminSecretKey = null) => {
    try {
      const res = await authApi.switchDemo(role, studentIndex, adminSecretKey);
      const { token, user: switchedUser, profile: switchedProfile } = res.data;
      localStorage.setItem('datelock_token', token);
      localStorage.setItem('datelock_demo_user_id', switchedUser.id);
      setUser(switchedUser);
      setProfile(switchedProfile);
      return res.data;
    } catch (err) {
      console.error('Failed to switch demo persona:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('datelock_token');
    localStorage.removeItem('datelock_demo_user_id');
    setUser(null);
    setProfile(null);
  };

  const updateProfileData = (updatedProfile) => {
    setProfile(prev => ({ ...prev, ...updatedProfile }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      login,
      register,
      switchDemoPersona,
      logout,
      updateProfileData,
      isAdmin: user?.role === 'admin',
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
