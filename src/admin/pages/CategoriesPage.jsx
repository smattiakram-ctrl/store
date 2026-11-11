import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, ImagePlus } from "lucide-react";
import { getCategories, createCategory, updateCategory, deleteCategory, uploadImage } from "../../data/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", image: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    getCategories().then(setCategories).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  function openAdd() {
    setForm({ name: "", image: "" });
    setError("");
    setModal({ mode: "add" });
  }

  function openEdit(c) {
    setForm({ name: c.name, image: c.image || "" });
    setError("");
    setModal({ mode: "edit", category: c });
  }

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const payload = { name: form.name.trim(), image: form.image || null };
    try {
      if (modal.mode === "add") await createCategory(payload);
      else await updateCategory(modal.category.id, payload);
      setModal(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(c) {
    if (!window.confirm(`حذف التصنيف "${c.name}"؟`)) return;
    try {
      await deleteCategory(c.id);
      setCategories((list) => list.filter((x) => x.id !== c.id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-emerald-950">التصنيفات</h1>
          <p className="text-emerald-900/60 mt-1">{categories.length} تصنيف</p>
        </div>
        <button onClick={openAdd} className="btn-gold !py-3">
          <Plus className="w-5 h-5" /> إضافة تصنيف
        </button>
      </div>

      {loading ? (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 bg-white rounded-3xl animate-pulse" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="mt-10 bg-white rounded-3xl border border-emerald-100 py-20 text-center shadow-card">
          <p className="text-xl font-black text-emerald-950">لا توجد تصنيفات حاليًا</p>
        </div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="bg-white rounded-3xl border border-emerald-100 shadow-card p-5 flex items-center gap-4">
              <span className="w-16 h-16 rounded-2xl bg-emerald-50 overflow-hidden shrink-0 grid place-items-center">
                {c.image
                  ? <img src={c.image} alt="" className="w-full h-full object-cover" />
                  : <ImagePlus className="w-6 h-6 text-emerald-300" />}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-emerald-950 truncate">{c.name}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="w-9 h-9 rounded-xl bg-gold-300/25 text-gold-600 grid place-items-center hover:bg-gold-400 hover:text-emerald-950 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(c)} className="w-9 h-9 rounded-xl bg-red-100 text-red-600 grid place-items-center hover:bg-red-500 hover:text-white transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 bg-emerald-950/70 backdrop-blur-sm grid place-items-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-emerald-950">{modal.mode === "add" ? "إضافة تصنيف" : "تعديل التصنيف"}</h2>
              <button onClick={() => setModal(null)} className="w-9 h-9 rounded-xl bg-emerald-50 grid place-items-center hover:bg-emerald-100">
                <X className="w-5 h-5 text-emerald-900" />
              </button>
            </div>

            {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl px-4 py-3">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-emerald-950 mb-1.5">اسم التصنيف</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-nabil" placeholder="مثال: إلكترونيات" />
              </div>
              <div>
                <label className="block text-sm font-bold text-emerald-950 mb-1.5">صورة التصنيف (اختياري)</label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-emerald-200 rounded-2xl py-6 cursor-pointer hover:border-gold-400 transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={uploading} />
                  {form.image ? (
                    <img src={form.image} alt="" className="h-24 rounded-xl object-cover" />
                  ) : (
                    <>
                      <ImagePlus className="w-7 h-7 text-emerald-400" />
                      <span className="text-sm text-emerald-900/60">{uploading ? "جارٍ الرفع..." : "اختيار صورة"}</span>
                    </>
                  )}
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={busy || uploading} className="btn-gold flex-1 justify-center disabled:opacity-60">
                  {busy ? "جارٍ الحفظ..." : "حفظ"}
                </button>
                <button type="button" onClick={() => setModal(null)} className="px-6 py-3.5 rounded-full border-2 border-emerald-200 font-bold text-emerald-950 hover:bg-emerald-50 transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
