// context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import toast from "react-hot-toast";

// Define User type here instead of importing from types.ts
interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to format user data and extract firstName/lastName
  const formatUserData = (userData: any): User => {
    // If user already has firstName and lastName
    if (userData.firstName && userData.lastName) {
      return userData;
    }
    
    // If user has name field, split it into firstName and lastName
    if (userData.name) {
      const nameParts = userData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return {
        ...userData,
        firstName,
        lastName,
      };
    }
    
    // If only email is available
    if (userData.email) {
      const emailName = userData.email.split('@')[0];
      return {
        ...userData,
        firstName: emailName,
        lastName: '',
      };
    }
    
    return userData;
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await authService.getMe();
          const formattedUser = formatUserData(userData);
          setUser(formattedUser);
        } catch (error) {
          console.error("Auth init error:", error);
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      
      if (response.token && response.user) {
        localStorage.setItem("token", response.token);
        
        const formattedUser = formatUserData(response.user);
        setUser(formattedUser);
        
        const displayName = formattedUser.firstName || formattedUser.name || 'User';
        toast.success(`Welcome back, ${displayName}!`);
        navigate("/dashboard");
      } else {
        toast.error("Login failed: Invalid server response");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;