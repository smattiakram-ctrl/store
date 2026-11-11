import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { me } from "../data/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Protects admin routes — server ALSO enforces auth/permissions on every API call.
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/admin/login", { replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-emerald-950">
        <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return children;
}

// Admin-only guard (Editor is blocked here — server enforces it too).
export function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (user?.role !== "admin") {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-emerald-950">غير مصرّح لك بالوصول</h2>
        <p className="text-emerald-900/60 mt-2">هذه الصفحة مخصصة للمدير فقط</p>
      </div>
    );
  }
  return children;
}
