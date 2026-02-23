import { useState } from "react";
import { Calendar, Tag } from "lucide-react";
import ScrollAnimation from "@/components/ScrollAnimation";

const categories = ["Wszystkie", "Mecze", "Klub", "Młodzież"];

const allNews = [
  { id: 1, title: "Zwycięstwo w derbach gminy!", excerpt: "Liszczanka pokonała rywali 3:1 w emocjonującym meczu derbowym. Bramki dla naszej drużyny zdobyli: Kowalski (15', 67') oraz Nowak (45').", date: "2026-02-20", category: "Mecze" },
  { id: 2, title: "Nabór do grup młodzieżowych", excerpt: "Zapraszamy dzieci w wieku 4-12 lat na treningi piłkarskie. Zajęcia prowadzone przez wykwalifikowanych trenerów.", date: "2026-02-18", category: "Młodzież" },
  { id: 3, title: "Nowy sponsor dołącza do klubu", excerpt: "Z radością witamy firmę Royal Ride jako nowego partnera Liszczanki.", date: "2026-02-15", category: "Klub" },
  { id: 4, title: "Przegrana na wyjeździe 0:2", excerpt: "Niestety przegraliśmy wyjazdowe spotkanie z Orlętami Ryczów. Drużyna walczyła dzielnie, ale nie zdołała przełamać defensywy rywala.", date: "2026-02-12", category: "Mecze" },
  { id: 5, title: "Turniej halowy młodzików", excerpt: "Nasi najmłodsi piłkarze wzięli udział w turnieju halowym, zajmując drugie miejsce.", date: "2026-02-10", category: "Młodzież" },
  { id: 6, title: "Zebranie zarządu klubu", excerpt: "Odbyło się coroczne zebranie zarządu klubu, na którym podsumowano sezon jesienny i przedstawiono plany na wiosnę.", date: "2026-02-08", category: "Klub" },
];

const NewsPage = () => {
  const [activeCategory, setActiveCategory] = useState("Wszystkie");

  const filtered = activeCategory === "Wszystkie"
    ? allNews
    : allNews.filter((n) => n.category === activeCategory);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ScrollAnimation>
          <h1 className="section-heading text-4xl md:text-5xl mb-2">Aktualności</h1>
          <div className="section-heading-accent mb-8" />
        </ScrollAnimation>

        <ScrollAnimation delay={0.1}>
          <div className="flex gap-2 mb-10 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </ScrollAnimation>

        <div className="space-y-6">
          {filtered.map((item, i) => (
            <ScrollAnimation key={item.id} delay={i * 0.05}>
              <article className="glass-card rounded-xl p-6 hover-lift cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {item.category}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {item.date}
                  </span>
                </div>
                <h2 className="font-heading text-xl font-bold text-foreground mb-2">{item.title}</h2>
                <p className="text-sm text-muted-foreground">{item.excerpt}</p>
              </article>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
