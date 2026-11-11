import { Routes, Route, NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Package, FolderTree, Settings, Users, LogOut, Store, ExternalLink,
} from "lucide-react";
import { AuthProvider, useAuth, RequireAuth, RequireAdmin } from "./auth";
import { logout } from "../data/api";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import SettingsPage from "./pages/SettingsPage";
import UsersPage from "./pages/UsersPage";

const nav = [
  { to: "/admin", icon: LayoutDashboard, label: "لوحة القيادة", end: true, roles: ["admin", "editor"] },
  { to: "/admin/products", icon: Package, label: "المنتجات", roles: ["admin", "editor"] },
  { to: "/admin/categories", icon: FolderTree, label: "التصنيفات", roles: ["admin", "editor"] },
  { to: "/admin/settings", icon: Settings, label: "إعدادات المتجر", roles: ["admin", "editor"] },
  { to: "/admin/users", icon: Users, label: "المستخدمون", roles: ["admin"] },
];

function Shell({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout().catch(() => {});
    navigate("/admin/login", { replace: true });
  }

  const items = nav.filter((n) => n.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-emerald-50/50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-emerald-950 text-white flex flex-col fixed inset-y-0 right-0 z-40">
        <div className="flex items-center gap-2.5 px-6 h-18 py-5 border-b border-white/10">
          <span className="w-10 h-10 rounded-2xl bg-gold-400 grid place-items-center">
            <Store className="w-5 h-5 text-emerald-950" />
          </span>
          <div>
            <div className="font-black text-lg leading-none">NABIL<span className="text-gold-400">.</span></div>
            <div className="text-[11px] text-white/50 mt-1">لوحة التحكم</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {items.map((n) => (
            <NavLink
              key={n.to} to={n.to} end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive ? "bg-gold-400 text-emerald-950 shadow-gold" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <n.icon className="w-5 h-5" /> {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-2">
            <span className="w-9 h-9 rounded-full bg-emerald-700 grid place-items-center font-black text-gold-300">
              {user.name?.[0] || "؟"}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-bold truncate">{user.name}</div>
              <div className="text-[11px] text-gold-300">{user.role === "admin" ? "مدير" : "محرر"}</div>
            </div>
          </div>
          <a href="/" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-white/60 hover:text-gold-300 text-xs px-2 pt-1">
            <ExternalLink className="w-3.5 h-3.5" /> عرض الموقع
          </a>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-300 hover:bg-red-500/10 text-sm font-bold transition-colors">
            <LogOut className="w-4.5 h-4.5 w-5 h-5" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 mr-64 p-6 lg:p-10 min-w-0">{children}</main>
    </div>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <RequireAuth>
        <Shell>
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="users" element={<RequireAdmin><UsersPage /></RequireAdmin>} />
          </Routes>
        </Shell>
      </RequireAuth>
    </AuthProvider>
  );
}

function DashboardHome() {
  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-black text-emerald-950">مرحبًا بك في لوحة تحكم NABIL</h1>
      <p className="text-emerald-900/60 mt-2">إدارة المنتجات والتصنيفات وإعدادات المتجر من مكان واحد.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
        {[
          { icon: Package, title: "المنتجات", desc: "إضافة وتعديل وحذف المنتجات" },
          { icon: FolderTree, title: "التصنيفات", desc: "تنظيم المنتجات في تصنيفات" },
          { icon: Settings, title: "الإعدادات", desc: "روابط التواصل والخريطة" },
          { icon: Store, title: "الموقع العام", desc: "تظهر التغييرات تلقائيًا" },
        ].map((c) => (
          <div key={c.title} className="bg-white rounded-3xl p-6 shadow-card border border-emerald-100 hover:-translate-y-1 transition-transform">
            <span className="w-12 h-12 rounded-2xl bg-emerald-950 grid place-items-center">
              <c.icon className="w-6 h-6 text-gold-400" />
            </span>
            <h3 className="mt-4 font-black text-emerald-950">{c.title}</h3>
            <p className="text-sm text-emerald-900/50 mt-1">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
