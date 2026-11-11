import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, CheckCircle2, XCircle, ImagePlus } from "lucide-react";
import {
  getProducts, getCategories, createProduct, updateProduct, deleteProduct, uploadImage,
} from "../../data/api";

const emptyForm = { name: "", price: "", category_id: "", available: true, image: "" };

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | {mode:'add'} | {mode:'edit', product}
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  function openAdd() {
    setForm(emptyForm);
    setError("");
    setModal({ mode: "add" });
  }

  function openEdit(p) {
    setForm({ name: p.name, price: String(p.price), category_id: p.category_id || "", available: !!p.available, image: p.image || "" });
    setError("");
    setModal({ mode: "edit", product: p });
  }

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
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
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      category_id: form.category_id || null,
      available: form.available,
      image: form.image || null,
    };
    try {
      if (modal.mode === "add") await createProduct(payload);
      else await updateProduct(modal.product.id, payload);
      setModal(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(p) {
    if (!window.confirm(`حذف المنتج "${p.name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
    try {
      await deleteProduct(p.id);
      setProducts((list) => list.filter((x) => x.id !== p.id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-emerald-950">المنتجات</h1>
          <p className="text-emerald-900/60 mt-1">{products.length} منتج</p>
        </div>
        <button onClick={openAdd} className="btn-gold !py-3">
          <Plus className="w-5 h-5" /> إضافة منتج
        </button>
      </div>

      {loading ? (
        <div className="mt-10 grid gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : products.length === 0 ? (
        <div className="mt-10 bg-white rounded-3xl border border-emerald-100 py-20 text-center shadow-card">
          <p className="text-xl font-black text-emerald-950">لا توجد منتجات حاليًا</p>
          <p className="text-emerald-900/50 mt-2">ابدأ بإضافة أول منتج من الزر أعلاه</p>
        </div>
      ) : (
        <div className="mt-8 bg-white rounded-3xl border border-emerald-100 shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-950 text-white text-right">
                <th className="px-5 py-4 font-bold">المنتج</th>
                <th className="px-5 py-4 font-bold">السعر</th>
                <th className="px-5 py-4 font-bold">التصنيف</th>
                <th className="px-5 py-4 font-bold">الحالة</th>
                <th className="px-5 py-4 font-bold text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-emerald-100 hover:bg-emerald-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-12 h-12 rounded-xl bg-emerald-50 overflow-hidden shrink-0 grid place-items-center">
                        {p.image
                          ? <img src={p.image} alt="" className="w-full h-full object-cover" />
                          : <ImagePlus className="w-5 h-5 text-emerald-300" />}
                      </span>
                      <span className="font-bold text-emerald-950">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-black text-emerald-700 whitespace-nowrap">
                    {Number(p.price).toLocaleString("ar-DZ")} دج
                  </td>
                  <td className="px-5 py-4 text-emerald-900/70">{p.category_name || "—"}</td>
                  <td className="px-5 py-4">
                    {p.available
                      ? <span className="badge-available"><CheckCircle2 className="w-3.5 h-3.5" /> متوفر</span>
                      : <span className="badge-out"><XCircle className="w-3.5 h-3.5" /> نفد من المخزون</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(p)} title="تعديل"
                        className="w-9 h-9 rounded-xl bg-gold-300/25 text-gold-600 grid place-items-center hover:bg-gold-400 hover:text-emerald-950 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p)} title="حذف"
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

      {/* Add / Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-emerald-950/70 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto" onClick={() => setModal(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-7 animate-fade-up my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-emerald-950">
                {modal.mode === "add" ? "إضافة منتج جديد" : "تعديل المنتج"}
              </h2>
              <button onClick={() => setModal(null)} className="w-9 h-9 rounded-xl bg-emerald-50 grid place-items-center hover:bg-emerald-100">
                <X className="w-5 h-5 text-emerald-900" />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl px-4 py-3">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-emerald-950 mb-1.5">اسم المنتج</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-nabil" placeholder="مثال: هاتف ذكي" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-emerald-950 mb-1.5">السعر (دج)</label>
                  <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-nabil" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-emerald-950 mb-1.5">التصنيف</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-nabil">
                    <option value="">بدون تصنيف</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-emerald-950 mb-1.5">صورة المنتج</label>
                <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl py-6 cursor-pointer transition-colors ${uploading ? "border-gold-400 bg-gold-300/10" : "border-emerald-200 hover:border-gold-400 hover:bg-gold-300/5"}`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={uploading} />
                  {form.image ? (
                    <img src={form.image} alt="" className="h-28 rounded-xl object-cover" />
                  ) : (
                    <>
                      <ImagePlus className="w-8 h-8 text-emerald-400" />
                      <span className="text-sm text-emerald-900/60">{uploading ? "جارٍ رفع الصورة..." : "اضغط لاختيار صورة"}</span>
                    </>
                  )}
                </label>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} className="w-5 h-5 accent-emerald-700" />
                <span className="font-bold text-emerald-950">المنتج متوفر في المخزون</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={busy || uploading} className="btn-gold flex-1 justify-center disabled:opacity-60">
                  {busy ? "جارٍ الحفظ..." : modal.mode === "add" ? "إضافة المنتج" : "حفظ التعديلات"}
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
