import { useState, useEffect, useMemo } from "react";
import Header from "./Header";
import Hero from "./Hero";
import Categories from "./Categories";
import Products from "./Products";
import Contact from "./Contact";
import MapSection from "./MapSection";
import Footer from "./Footer";
import { getProducts, getCategories, getSettings } from "../data/api";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCategories(), getSettings()])
      .then(([p, c, s]) => {
        setProducts(p);
        setCategories(c);
        setSettings(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim();
    return products.filter((p) => {
      const matchCat = !activeCategory || p.category_id === activeCategory;
      const matchSearch = !q || p.name.includes(q);
      return matchCat && matchSearch;
    });
  }, [products, search, activeCategory]);

  return (
    <div className="min-h-screen bg-white">
      <Header search={search} onSearch={setSearch} />
      <main>
        <Hero />
        <Categories categories={categories} active={activeCategory} onSelect={setActiveCategory} />
        <Products products={filtered} search={search} onSearch={setSearch} loading={loading} />
        <Contact settings={settings} />
        <MapSection settings={settings} />
      </main>
      <Footer settings={settings} />
    </div>
  );
}
