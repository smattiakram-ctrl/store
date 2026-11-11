import { ArrowLeft, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-emerald-950">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #10b981 0%, transparent 40%), radial-gradient(circle at 80% 70%, #d4af37 0%, transparent 35%), radial-gradient(circle at 60% 20%, #047857 0%, transparent 45%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-emerald-950/60" />

      {/* Gold ring decorations */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border-[3px] border-gold-400/20 animate-float-slow" />
      <div className="absolute -bottom-40 -right-20 w-[28rem] h-[28rem] rounded-full border-[3px] border-emerald-500/20 animate-float-slow" style={{ animationDelay: "2s" }} />

      <div className="container-nabil relative z-10 pt-28 pb-20 text-center">
        <span className="inline-flex items-center gap-2 bg-white/10 border border-gold-400/40 text-gold-300 text-sm font-bold px-5 py-2 rounded-full mb-8 animate-fade-up">
          <Sparkles className="w-4 h-4" /> متجر جزائري محلي
        </span>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight animate-fade-up" style={{ animationDelay: ".1s" }}>
          اكتشف منتجاتنا <span className="text-transparent bg-clip-text bg-gradient-to-l from-gold-300 to-gold-500">المحلية</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: ".2s" }}>
          منتجات متنوعة، جودة مميزة، وخدمة قريبة منك.
        </p>

        <div className="mt-10 animate-fade-up" style={{ animationDelay: ".3s" }}>
          <a href="#products" className="btn-gold text-lg">
            استكشف المنتجات
            <ArrowLeft className="w-5 h-5" />
          </a>
        </div>

        {/* Stats strip */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: ".4s" }}>
          {[
            ["+منتجات", "تشكيلة متجددة"],
            ["جودة", "منتجات أصلية"],
            ["قريبون", "منك أينما كنت"],
          ].map(([t, s]) => (
            <div key={t} className="bg-white/5 border border-white/10 rounded-2xl py-5 px-3 backdrop-blur">
              <div className="text-gold-300 font-black text-lg sm:text-2xl">{t}</div>
              <div className="text-white/60 text-xs sm:text-sm mt-1">{s}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
