import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";

// Admin dashboard is code-split so it never slows down the public website.
const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const AdminApp = lazy(() => import("./admin/AdminApp"));

function Loader() {
  return (
    <div className="min-h-screen grid place-items-center bg-emerald-950">
      <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </Suspense>
  );
}
