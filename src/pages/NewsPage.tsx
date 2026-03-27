import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Tag } from "lucide-react";
import { useNewsList, useNewsPost } from "@/hooks/use-queries";
import ScrollAnimation from "@/components/ScrollAnimation";
import { renderNewsContent } from "@/lib/renderNewsContent";

const categoriesFilter = ["Wszystkie", "Mecze", "Klub", "Młodzież"];

const NewsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Wszystkie");

  const { data: posts = [], isLoading: loading } = useNewsList();
  const { data: fetchedPost, isLoading: postLoading } = useNewsPost(id);

  const filtered =
    activeCategory === "Wszystkie"
      ? posts
      : posts.filter((n) => n.category === activeCategory);

  if (id) {
    if (postLoading) {
      return (
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center py-12 text-muted-foreground">Ładowanie aktualności...</div>
          </div>
        </div>
      );
    }

    if (!fetchedPost) {
      return (
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <button
              onClick={() => navigate("/aktualnosci")}
              className="text-sm text-primary hover:text-primary/80 mb-6 inline-block"
            >
              ← Powrót do aktualności
            </button>
            <div className="text-center py-12 text-muted-foreground">
              Nie znaleziono tej aktualności.
            </div>
          </div>
        </div>
      );
    }

    const relatedPosts = posts.filter((post) => post.id !== fetchedPost.id).slice(0, 4);

    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <ScrollAnimation>
            <button
              onClick={() => navigate("/aktualnosci")}
              className="text-sm text-primary hover:text-primary/80 mb-6 inline-block"
            >
              ← Powrót do aktualności
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {fetchedPost.category}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(fetchedPost.created_at).toLocaleDateString("pl-PL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
              {fetchedPost.title}
            </h1>
            {fetchedPost.image_url && (
              <img
                src={fetchedPost.image_url}
                alt={fetchedPost.title}
                className="w-full h-64 md:h-96 object-cover rounded-xl mb-6"
                loading="eager"
              />
            )}
            <div
              className="prose prose-invert max-w-none text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: renderNewsContent(fetchedPost.content || ""),
              }}
            />
          </ScrollAnimation>

          {relatedPosts.length > 0 && (
            <section className="mt-16 border-t border-border pt-10">
              <h2 className="font-heading text-xl font-bold text-foreground mb-6">Przeczytaj również</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => {
                      navigate(`/aktualnosci/${post.slug}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="glass-card rounded-xl overflow-hidden hover-lift cursor-pointer flex flex-col"
                  >
                    {post.image_url ? (
                      <img src={post.image_url} alt={post.title} className="w-full h-36 object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-36 bg-muted flex items-center justify-center">
                        <Tag className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {post.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString("pl-PL")}
                        </span>
                      </div>
                      <h3 className="font-heading text-sm font-bold text-foreground line-clamp-2">{post.title}</h3>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
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
                  onClick={() => navigate(`/aktualnosci/${item.slug}`)}
                  className="glass-card rounded-xl overflow-hidden hover-lift cursor-pointer flex flex-col sm:flex-row"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full sm:w-48 md:w-56 h-44 sm:h-auto object-cover shrink-0"
                      loading="lazy"
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
