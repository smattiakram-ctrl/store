import { Search, PackageOpen, CheckCircle2, XCircle } from "lucide-react";
import { imageUrl } from "../data/api";

export default function Products({ products, search, onSearch, loading }) {
  return (
    <section id="products" className="py-20 bg-white">
      <div className="container-nabil">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <h2 className="section-title">المنتجات</h2>
            <p className="text-emerald-900/60 mt-5">تصفح تشكيلتنا من المنتجات المتوفرة</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-900/40" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="input-nabil pr-12"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-emerald-50 animate-pulse h-96" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <PackageOpen className="w-20 h-20 mx-auto text-emerald-200 mb-6" />
            <h3 className="text-2xl font-black text-emerald-950">لا توجد منتجات حاليًا</h3>
            <p className="text-emerald-900/50 mt-3">تابعنا قريبًا، سيتم إضافة منتجات جديدة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <article
                key={p.id}
                className="group bg-white rounded-3xl border border-emerald-100 overflow-hidden shadow-card hover:-translate-y-2 transition-all duration-300"
              >
                <div className="relative h-56 overflow-hidden bg-emerald-50">
                  {p.image ? (
                    <img
                      src={imageUrl(p.image)}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center">
                      <PackageOpen className="w-16 h-16 text-emerald-200" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    {p.available ? (
                      <span className="badge-available">
                        <CheckCircle2 className="w-3.5 h-3.5" /> متوفر
                      </span>
                    ) : (
                      <span className="badge-out">
                        <XCircle className="w-3.5 h-3.5" /> نفد من المخزون
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <span className="text-xs font-bold text-gold-600 bg-gold-300/20 px-3 py-1 rounded-full">
                    {p.category_name || "بدون تصنيف"}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-emerald-950 leading-snug min-h-[3.5rem]">{p.name}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xl font-black text-emerald-700">
                      {Number(p.price).toLocaleString("ar-DZ")}
                      <span className="text-sm font-bold text-emerald-900/50 mr-1">دج</span>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
