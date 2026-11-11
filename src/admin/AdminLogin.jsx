import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Lock, Mail, LogIn } from "lucide-react";
import { login } from "../data/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "بيانات الدخول غير صحيحة");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #d4af37 0%, transparent 40%), radial-gradient(circle at 80% 80%, #10b981 0%, transparent 40%)" }} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 animate-fade-up">
        <div className="text-center mb-8">
          <span className="w-16 h-16 mx-auto rounded-3xl bg-emerald-950 grid place-items-center shadow-card">
            <Store className="w-8 h-8 text-gold-400" />
          </span>
          <h1 className="mt-5 text-3xl font-black text-emerald-950">لوحة التحكم</h1>
          <p className="text-emerald-900/50 mt-2 text-sm">تسجيل الدخول متاح للموظفين المصرّح لهم فقط</p>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-900/40" />
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني" className="input-nabil pr-12" dir="ltr" />
          </div>
          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-900/40" />
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور" className="input-nabil pr-12" dir="ltr" />
          </div>
          <button
            type="submit" disabled={busy}
            className="btn-gold w-full justify-center text-lg disabled:opacity-60"
          >
            <LogIn className="w-5 h-5" />
            {busy ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <a href="/" className="block text-center mt-6 text-sm text-emerald-900/50 hover:text-gold-600 transition-colors">
          ← العودة إلى الموقع
        </a>
      </div>
    </div>
  );
}
