import { Store, MessageCircle, Phone } from "lucide-react";

const links = [
  { href: "#home", label: "الرئيسية" },
  { href: "#products", label: "المنتجات" },
  { href: "#categories", label: "التصنيفات" },
  { href: "#about", label: "من نحن" },
  { href: "#contact", label: "اتصل بنا" },
];

export default function Footer({ settings = {} }) {
  return (
    <footer className="bg-emerald-950 text-white border-t border-white/10">
      <div className="container-nabil py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-10 h-10 rounded-2xl bg-gold-400 grid place-items-center">
              <Store className="w-5 h-5 text-emerald-950" />
            </span>
            <span className="text-2xl font-black">NABIL<span className="text-gold-400">.</span></span>
          </div>
          <p className="text-white/60 leading-relaxed max-w-xs">
            متجر جزائري محلي يقدم منتجات متنوعة بجودة مميزة وخدمة قريبة منك.
          </p>
        </div>

        <div>
          <h4 className="font-black text-lg mb-4 text-gold-300">روابط سريعة</h4>
          <ul className="grid grid-cols-2 gap-2">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-white/60 hover:text-gold-300 transition-colors text-sm">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-black text-lg mb-4 text-gold-300">تابعنا</h4>
          <div className="flex gap-3">
            <a href={settings.facebook_url || "#"} target="_blank" rel="noreferrer" aria-label="فيسبوك"
              className="w-11 h-11 rounded-2xl bg-white/10 grid place-items-center hover:bg-gold-400 hover:text-emerald-950 transition-all">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href={settings.whatsapp_url || "#"} target="_blank" rel="noreferrer" aria-label="واتساب"
              className="w-11 h-11 rounded-2xl bg-white/10 grid place-items-center hover:bg-gold-400 hover:text-emerald-950 transition-all">
              <Phone className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-white/50 text-sm">
        © {new Date().getFullYear()} متجر NABIL — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
