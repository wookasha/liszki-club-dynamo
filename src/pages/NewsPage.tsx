import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ScrollAnimation from "@/components/ScrollAnimation";

const categoriesFilter = ["Wszystkie", "Mecze", "Klub", "Młodzież"];

interface NewsPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string | null;
  created_at: string;
  slug: string;
}

const NewsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Wszystkie");
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (id && posts.length > 0) {
      const post = posts.find((p) => p.id === id);
      if (post) setSelectedPost(post);
      else {
        // Fetch single post by ID if not in list
        supabase.from("news_posts").select("*").eq("id", id).single()
          .then(({ data }) => { if (data) setSelectedPost(data as NewsPost); });
      }
    }
  }, [id, posts]);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("news_posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    setPosts((data as NewsPost[]) || []);
    setLoading(false);
  };

  const filtered = activeCategory === "Wszystkie"
    ? posts
    : posts.filter((n) => n.category === activeCategory);

  if (selectedPost) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <ScrollAnimation>
            <button
              onClick={() => { setSelectedPost(null); navigate("/aktualnosci"); }}
              className="text-sm text-primary hover:text-primary/80 mb-6 inline-block"
            >
              ← Powrót do aktualności
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {selectedPost.category}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(selectedPost.created_at).toLocaleDateString("pl-PL", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              {selectedPost.title}
            </h1>
            {selectedPost.image_url && (
              <img
                src={selectedPost.image_url}
                alt={selectedPost.title}
                className="w-full h-64 md:h-96 object-cover rounded-xl mb-6"
              />
            )}
            <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {selectedPost.content}
            </div>
          </ScrollAnimation>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ScrollAnimation>
          <h1 className="section-heading text-4xl md:text-5xl mb-2">Aktualności</h1>
          <div className="section-heading-accent mb-8" />
        </ScrollAnimation>

        <ScrollAnimation delay={0.1}>
          <div className="flex gap-2 mb-10 flex-wrap">
            {categoriesFilter.map((cat) => (
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

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Ładowanie aktualności...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Brak aktualności w tej kategorii.</div>
        ) : (
          <div className="space-y-6">
            {filtered.map((item, i) => (
              <ScrollAnimation key={item.id} delay={i * 0.05}>
                 <article
                  onClick={() => { setSelectedPost(item); navigate(`/aktualnosci/${item.id}`); }}
                  className="glass-card rounded-xl overflow-hidden hover-lift cursor-pointer flex flex-col sm:flex-row"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full sm:w-48 md:w-56 h-44 sm:h-auto object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-full sm:w-48 md:w-56 h-44 sm:h-auto bg-muted shrink-0 flex items-center justify-center">
                      <Tag className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {item.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString("pl-PL")}
                      </span>
                    </div>
                    <h2 className="font-heading text-xl font-bold text-foreground mb-2">{item.title}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                  </div>
                </article>
              </ScrollAnimation>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
