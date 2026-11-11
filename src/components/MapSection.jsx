import { MapPin } from "lucide-react";

export default function MapSection({ settings = {} }) {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container-nabil">
        <div className="text-center mb-12">
          <h2 className="section-title">موقع المتجر</h2>
          <p className="text-emerald-900/60 mt-5">تفضل بزيارتنا في متجرنا</p>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-card border border-emerald-100">
          {settings.maps_embed ? (
            <iframe
              title="موقع المتجر"
              src={settings.maps_embed}
              className="w-full h-[420px] border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            /* Placeholder map — replace with the real Google Maps embed from the admin dashboard */
            <div className="w-full h-[420px] bg-gradient-to-br from-emerald-100 to-emerald-50 grid place-items-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.15]"
                style={{
                  backgroundImage:
                    "linear-gradient(#065f46 1px, transparent 1px), linear-gradient(90deg, #065f46 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }} />
              <div className="relative text-center">
                <span className="w-20 h-20 mx-auto rounded-full bg-gold-400 grid place-items-center shadow-gold animate-float-slow">
                  <MapPin className="w-10 h-10 text-emerald-950" />
                </span>
                <h3 className="mt-5 text-xl font-black text-emerald-950">موقع المتجر</h3>
                <p className="text-emerald-900/50 mt-2">سيتم إضافة الموقع الدقيق قريبًا</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
