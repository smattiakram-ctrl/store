import { Smartphone, Home, Watch, PlugZap, Package } from "lucide-react";
import { imageUrl } from "../data/api";

// Placeholder categories — Admin can add/edit categories with images from the dashboard.
const fallbackIcons = [Smartphone, Home, Watch, PlugZap, Package];

export default function Categories({ categories, active, onSelect }) {
  return (
    <section id="categories" className="py-20 bg-gradient-to-b from-emerald-50/60 to-white">
      <div className="container-nabil">
        <div className="text-center mb-12">
          <h2 className="section-title">التصنيفات</h2>
          <p className="text-emerald-900/60 mt-5">تصفح منتجاتنا حسب التصنيف</p>
        </div>

        {categories.length === 0 ? (
          <p className="text-center text-emerald-900/50 py-8">لا توجد تصنيفات حاليًا</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {categories.map((cat, i) => {
              const Icon = fallbackIcons[i % fallbackIcons.length];
              const selected = active === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelect(selected ? "" : cat.id)}
                  className={`group relative rounded-3xl overflow-hidden text-right transition-all duration-300 hover:-translate-y-2 hover:shadow-card ${
                    selected ? "ring-4 ring-gold-400" : ""
                  }`}
                >
                  {cat.image ? (
                    <img src={imageUrl(cat.image)} alt={cat.name} className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-emerald-800 to-emerald-950 grid place-items-center">
                      <Icon className="w-12 h-12 text-gold-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent" />
                  <div className="absolute bottom-0 right-0 p-4 w-full">
                    <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
