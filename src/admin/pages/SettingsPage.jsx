import { useState, useEffect } from "react";
import { Save, MessageCircle, Phone, MapPin, Map } from "lucide-react";
import { getSettings, updateSettings } from "../../data/api";

export default function SettingsPage() {
  const [form, setForm] = useState({ facebook_url: "", whatsapp_url: "", maps_url: "", maps_embed: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getSettings().then((s) => setForm({
      facebook_url: s.facebook_url || "",
      whatsapp_url: s.whatsapp_url || "",
      maps_url: s.maps_url || "",
      maps_embed: s.maps_embed || "",
    })).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    setError("");
    try {
      await updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="h-64 bg-white rounded-3xl animate-pulse" />;

  const fields = [
    { key: "facebook_url", icon: MessageCircle, label: "رابط Facebook Messenger", placeholder: "https://m.me/..." },
    { key: "whatsapp_url", icon: Phone, label: "رابط WhatsApp", placeholder: "https://wa.me/213..." },
    { key: "maps_url", icon: MapPin, label: "رابط Google Maps", placeholder: "https://maps.google.com/..." },
    { key: "maps_embed", icon: Map, label: "كود تضمين الخريطة (Embed URL)", placeholder: "https://www.google.com/maps/embed?..." },
  ];

  return (
    <div className="animate-fade-up max-w-2xl">
      <h1 className="text-3xl font-black text-emerald-950">إعدادات المتجر</h1>
      <p className="text-emerald-900/60 mt-1">روابط التواصل والخريطة تظهر مباشرة على الموقع العام</p>

      {error && <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl px-4 py-3">{error}</div>}
      {saved && <div className="mt-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold rounded-xl px-4 py-3">تم حفظ الإعدادات بنجاح ✓</div>}

      <form onSubmit={handleSubmit} className="mt-8 bg-white rounded-3xl border border-emerald-100 shadow-card p-7 space-y-5">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="flex items-center gap-2 text-sm font-bold text-emerald-950 mb-1.5">
              <f.icon className="w-4 h-4 text-gold-600" /> {f.label}
            </label>
            <input
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="input-nabil" dir="ltr" placeholder={f.placeholder}
            />
          </div>
        ))}

        <button type="submit" disabled={busy} className="btn-gold w-full justify-center disabled:opacity-60">
          <Save className="w-5 h-5" />
          {busy ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
        </button>
      </form>
    </div>
  );
}
