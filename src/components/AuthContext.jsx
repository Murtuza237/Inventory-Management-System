import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext({ user: null, role: null, profile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const fetchMe = async () => {
    try {
      if (!localStorage.getItem("token")) {
        setUser(null);
        setRole(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      const res = await api.get("/auth/me");
      const userData = res.data.user;
      setUser(userData);
      setProfile(userData);
      setRole(userData?.role || null);
    } catch (err) {
      console.error("Auth fetch error:", err);
      localStorage.removeItem("token");
      setUser(null);
      setRole(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data && res.data.token) {
      localStorage.setItem("token", res.data.token);
      await fetchMe();
    } else {
      throw new Error("Invalid response");
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    setRole(null);
    setProfile(null);
  };

  const value = useMemo(
    () => ({ user, role, profile, loading, login, signOut, fetchMe, setUser }),
    [user, role, profile, loading]
  );


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


