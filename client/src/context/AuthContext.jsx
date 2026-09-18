import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const VALID_CREDENTIALS = {
  email: 'kavalx@kavalx.in',
  password: 'kavalx@2026',
  name: 'KAAVALX Security Admin',
  role: 'SOC Incident Responder & Admin'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('kaavalx_auth_user') || localStorage.getItem('aegisguard_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    // Trim inputs
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPassword = (password || '').trim();

    if (
      trimmedEmail === VALID_CREDENTIALS.email.toLowerCase() &&
      trimmedPassword === VALID_CREDENTIALS.password
    ) {
      const userData = {
        email: VALID_CREDENTIALS.email,
        name: VALID_CREDENTIALS.name,
        role: VALID_CREDENTIALS.role,
        loginTime: new Date().toISOString()
      };
      setUser(userData);
      localStorage.setItem('kaavalx_auth_user', JSON.stringify(userData));
      return { success: true };
    } else {
      return { 
        success: false, 
        message: 'Invalid email or password. Please check your credentials.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kaavalx_auth_user');
    localStorage.removeItem('aegisguard_auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, credentials: VALID_CREDENTIALS }}>
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
