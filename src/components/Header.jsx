import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, Store } from "lucide-react";

const links = [
  { href: "#home", label: "الرئيسية" },
  { href: "#products", label: "المنتجات" },
  { href: "#categories", label: "التصنيفات" },
  { href: "#about", label: "من نحن" },
  { href: "#contact", label: "اتصل بنا" },
];

export default function Header({ search, onSearch }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-emerald-950/95 backdrop-blur shadow-lg" : "bg-emerald-950"
      }`}
    >
      <div className="container-nabil flex items-center justify-between h-18 py-3">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2.5 group">
          <span className="w-11 h-11 rounded-2xl bg-gold-400 grid place-items-center shadow-gold group-hover:rotate-6 transition-transform">
            <Store className="w-6 h-6 text-emerald-950" />
          </span>
          <span className="text-2xl font-black tracking-wide text-white">
            NABIL<span className="text-gold-400">.</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href}
              className="text-white/85 hover:text-gold-300 font-medium transition-colors text-[15px]">
              {l.label}
            </a>
          ))}
        </nav>

        {/* Search */}
        <div className="hidden md:flex items-center relative">
          <Search className="absolute right-3.5 w-4.5 h-4.5 w-5 h-5 text-emerald-900/50" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="bg-white/10 text-white placeholder-white/50 rounded-full pr-11 pl-5 py-2.5 w-56 focus:w-72 transition-all focus:outline-none focus:ring-2 focus:ring-gold-400 text-sm"
          />
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="lg:hidden text-white p-2" aria-label="القائمة">
          {open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-96" : "max-h-0"}`}>
        <nav className="container-nabil pb-5 flex flex-col gap-1 bg-emerald-950">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="text-white/90 hover:text-gold-300 py-3 border-b border-white/10 font-medium">
              {l.label}
            </a>
          ))}
          <div className="relative mt-3">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-900/50" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full bg-white text-emerald-950 rounded-full pr-11 pl-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>
        </nav>
      </div>
    </header>
  );
}
