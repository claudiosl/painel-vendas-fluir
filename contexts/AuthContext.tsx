import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'sdr' | 'closer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for active session
    const storedUser = localStorage.getItem('sales_optima_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = JSON.parse(localStorage.getItem('sales_optima_users_db') || '[]');
    const found = users.find((u: any) => u.email === email && u.pass === pass);
    
    if (found) {
      // Ensure legacy users have a default role if missing
      const role = found.role || 'admin'; 
      const userData: User = { id: found.id, name: found.name, email: found.email, role };
      setUser(userData);
      localStorage.setItem('sales_optima_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string, role: UserRole) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = JSON.parse(localStorage.getItem('sales_optima_users_db') || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      return false; // User exists
    }

    const newUser = { id: Math.random().toString(36).substr(2, 9), name, email, pass, role };
    users.push(newUser);
    localStorage.setItem('sales_optima_users_db', JSON.stringify(users));
    
    // Auto login
    const userData: User = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    setUser(userData);
    localStorage.setItem('sales_optima_user', JSON.stringify(userData));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sales_optima_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};