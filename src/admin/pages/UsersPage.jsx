import { useState, useEffect, useCallback } from "react";
import { UserPlus, Trash2, ShieldCheck, PenLine } from "lucide-react";
import { getUsers, inviteUser, updateUserRole, deleteUser } from "../../data/api";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "editor" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    getUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  async function handleInvite(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await inviteUser(form);
      setForm({ name: "", email: "", password: "", role: "editor" });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRoleChange(u, role) {
    try {
      await updateUserRole(u.id, role);
      setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, role } : x)));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(u) {
    if (!window.confirm(`حذف المستخدم "${u.name}"؟`)) return;
    try {
      await deleteUser(u.id);
      setUsers((list) => list.filter((x) => x.id !== u.id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-black text-emerald-950">إدارة المستخدمين</h1>
      <p className="text-emerald-900/60 mt-1">دعوة مستخدمين جدد وتحديد أدوارهم — للمدير فقط</p>

      {/* Invite form */}
      <form onSubmit={handleInvite} className="mt-8 bg-white rounded-3xl border border-emerald-100 shadow-card p-6">
        <h2 className="flex items-center gap-2 font-black text-emerald-950 mb-5">
          <UserPlus className="w-5 h-5 text-gold-600" /> دعوة مستخدم جديد
        </h2>
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl px-4 py-3">{error}</div>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="الاسم" className="input-nabil" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="البريد الإلكتروني" className="input-nabil" dir="ltr" />
          <input required type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="كلمة مرور (8+ أحرف)" className="input-nabil" dir="ltr" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-nabil">
            <option value="editor">محرر</option>
            <option value="admin">مدير</option>
          </select>
          <button type="submit" disabled={busy} className="btn-gold !py-3 justify-center disabled:opacity-60">
            {busy ? "..." : "دعوة"}
          </button>
        </div>
      </form>

      {/* Users table */}
      {loading ? (
        <div className="mt-8 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="mt-8 bg-white rounded-3xl border border-emerald-100 shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-950 text-white text-right">
                <th className="px-5 py-4 font-bold">المستخدم</th>
                <th className="px-5 py-4 font-bold">الدور</th>
                <th className="px-5 py-4 font-bold text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-emerald-100 hover:bg-emerald-50/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-emerald-950 grid place-items-center font-black text-gold-300">{u.name?.[0]}</span>
                      <div>
                        <div className="font-bold text-emerald-950">{u.name}</div>
                        <div className="text-xs text-emerald-900/50" dir="ltr">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      className={`rounded-xl px-3 py-2 font-bold text-xs border-0 cursor-pointer ${
                        u.role === "admin" ? "bg-gold-300/30 text-gold-600" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      <option value="editor">محرر</option>
                      <option value="admin">مدير</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 justify-end">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl">
                        {u.role === "admin" ? <ShieldCheck className="w-3.5 h-3.5" /> : <PenLine className="w-3.5 h-3.5" />}
                        {u.role === "admin" ? "صلاحيات كاملة" : "إدارة المحتوى فقط"}
                      </span>
                      <button onClick={() => handleDelete(u)}
                        className="w-9 h-9 rounded-xl bg-red-100 text-red-600 grid place-items-center hover:bg-red-500 hover:text-white transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
