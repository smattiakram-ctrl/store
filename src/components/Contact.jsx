import { MessageCircle, Phone, MapPin } from "lucide-react";

// Links come from the admin dashboard settings — placeholders until the store owner sets them.
export default function Contact({ settings = {} }) {
  const buttons = [
    {
      key: "facebook",
      label: "تواصل عبر Messenger",
      desc: "Facebook Messenger",
      icon: MessageCircle,
      href: settings.facebook_url || "#",
      color: "from-blue-600 to-blue-700",
    },
    {
      key: "whatsapp",
      label: "تواصل عبر واتساب",
      desc: "WhatsApp",
      icon: Phone,
      href: settings.whatsapp_url || "#",
      color: "from-emerald-600 to-emerald-700",
    },
    {
      key: "maps",
      label: "موقعنا على الخريطة",
      desc: "Google Maps",
      icon: MapPin,
      href: settings.maps_url || "#",
      color: "from-gold-500 to-gold-600",
    },
  ];

  return (
    <section id="contact" className="py-20 bg-emerald-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #d4af37 0%, transparent 40%)" }} />
      <div className="container-nabil relative z-10">
        <div className="text-center mb-12">
          <h2 className="section-title !text-white">اتصل بنا</h2>
          <p className="text-white/60 mt-5">يسعدنا تواصلك معنا في أي وقت</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {buttons.map((b) => (
            <a
              key={b.key}
              href={b.href}
              target="_blank"
              rel="noreferrer"
              className={`group bg-gradient-to-br ${b.color} rounded-3xl p-7 text-white text-center shadow-card hover:-translate-y-2 transition-all duration-300`}
            >
              <span className="w-14 h-14 mx-auto rounded-2xl bg-white/20 grid place-items-center mb-4 group-hover:scale-110 transition-transform">
                <b.icon className="w-7 h-7" />
              </span>
              <h3 className="font-black text-lg">{b.label}</h3>
              <p className="text-white/70 text-sm mt-1">{b.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
