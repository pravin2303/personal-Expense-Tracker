
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useLocalStorage<User[]>('expense-tracker-users', []);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('expense-tracker-current-user', null);
  const [isLoading, setIsLoading] = useState(false);

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      setIsLoading(false);
      return false;
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
    };

    // Store user credentials (in real app, never store plain passwords!)
    const userCredentials = { ...newUser, password };
    const credentials = JSON.parse(localStorage.getItem('expense-tracker-credentials') || '[]');
    credentials.push(userCredentials);
    localStorage.setItem('expense-tracker-credentials', JSON.stringify(credentials));

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setIsLoading(false);
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Get stored credentials
    const credentials = JSON.parse(localStorage.getItem('expense-tracker-credentials') || '[]');
    const userCredential = credentials.find((cred: any) => cred.email === email && cred.password === password);

    if (userCredential) {
      const { password: _, ...user } = userCredential;
      setCurrentUser(user);
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user: currentUser,
      login,
      signup,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
