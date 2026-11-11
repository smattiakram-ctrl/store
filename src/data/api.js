// ============================================================================
// NABIL Store — Data Access Layer
// All product/category/settings data comes from the Cloudflare Worker API.
// The public website NEVER contains fictional products:
// when the catalog is empty, it shows: "لا توجد منتجات حاليًا"
// ============================================================================

// Locally the Vite dev proxy forwards /api and /images to the Worker (localhost:8787).
// In production set VITE_API_URL in Cloudflare Pages env vars, e.g. https://nabil-api.your-name.workers.dev
const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const BASE = API_ORIGIN ? API_ORIGIN + "/api" : "/api";
const IMAGE_BASE = API_ORIGIN ? API_ORIGIN + "/images" : "/images";

// Rewrite R2 image URLs when the API lives on another origin in production.
export function imageUrl(path) {
  if (!path) return "";
  if (path.startsWith("/images/")) return IMAGE_BASE + path.slice("/images".length);
  return path;
}

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: options.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "حدث خطأ في الخادم");
  }
  if (res.status === 204) return null;
  return res.json();
}

// ---------- Public API ----------
export const getProducts = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`/products${q ? "?" + q : ""}`);
};
export const getCategories = () => request("/categories");
export const getSettings = () => request("/settings");

// ---------- Auth API ----------
export const login = (email, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const logout = () => request("/auth/logout", { method: "POST" });
export const me = () => request("/auth/me");

// ---------- Admin API (requires session, permissions enforced server-side) ----------
export const createProduct = (data) =>
  request("/admin/products", { method: "POST", body: JSON.stringify(data) });
export const updateProduct = (id, data) =>
  request(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProduct = (id) => request(`/admin/products/${id}`, { method: "DELETE" });

export const createCategory = (data) =>
  request("/admin/categories", { method: "POST", body: JSON.stringify(data) });
export const updateCategory = (id, data) =>
  request(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCategory = (id) => request(`/admin/categories/${id}`, { method: "DELETE" });

export const updateSettings = (data) =>
  request("/admin/settings", { method: "PUT", body: JSON.stringify(data) });

// Users management — Admin role only (server enforces this)
export const getUsers = () => request("/admin/users");
export const inviteUser = (data) =>
  request("/admin/users", { method: "POST", body: JSON.stringify(data) });
export const updateUserRole = (id, role) =>
  request(`/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) });
export const deleteUser = (id) => request(`/admin/users/${id}`, { method: "DELETE" });

// ---------- Image upload (Cloudflare R2) ----------
export async function uploadImage(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/admin/upload`, { method: "POST", body: form, credentials: "include" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "فشل رفع الصورة");
  }
  return res.json(); // { url }
}
