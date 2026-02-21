import api from "@/services/api";
import { getRefreshToken, getToken, removeToken, saveToken } from "@/utils/authStorage";
import React, { createContext, useContext, useEffect, useState } from "react";


interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = await getToken();
    console.log("CHECK USER - token existe:", !!token);

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me");
      console.log("CHECK USER - /auth/me OK:", res.data);
      setUser(res.data.user);
    } catch (error: any) {
      console.log("CHECK USER - error:", error?.response?.status, error?.message);
      await removeToken();
      setUser(null);
    } finally {
      console.log("CHECK USER - loading → false, user:", user);
      setLoading(false);
    }
  };

  const login = async (accessToken: string, refreshToken: string) => {
    await saveToken(accessToken, refreshToken);

    const res = await api.get("/auth/me");
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      const refreshToken = await getRefreshToken();

      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.log("Error cerrando sesión:", error);
    }

    await removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
