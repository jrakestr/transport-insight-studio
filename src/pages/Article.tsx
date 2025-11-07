import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { useArticles } from "@/hooks/useArticles";
import { format } from "date-fns";

const Article = () => {
  const { slug } = useParams();
  const { data: articles, isLoading } = useArticles();
  const article = articles?.find(a => a.slug === slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
            <Link to="/">
              <Button>Return Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Back Button */}
        <section className="border-b">
          <div className="section-container py-6">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to News
              </Button>
            </Link>
          </div>
        </section>

        {/* Article Content - Rich Layout */}
        <div className="bg-background px-6 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-base/7 text-foreground">
            {article.category && (
              <p className="text-base/7 font-semibold text-primary">
                {article.category}
              </p>
            )}
            
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl">
              {article.title}
            </h1>
            
            <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
              <time dateTime={article.published_at}>
                {format(new Date(article.published_at), 'MMMM d, yyyy')}
              </time>
              {article.author_name && (
                <>
                  <span>•</span>
                  <span>
                    {article.author_name}
                    {article.author_role && ` – ${article.author_role}`}
                  </span>
                </>
              )}
            </div>

            {article.source_url && (
              <div className="mt-4">
                <a 
                  href={article.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Original Source{article.source_name && ` from ${article.source_name}`}
                </a>
              </div>
            )}

            {article.image_url && (
              <figure className="mt-10">
                <img
                  alt={article.title}
                  src={article.image_url}
                  className="aspect-video rounded-xl bg-muted object-cover w-full"
                />
              </figure>
            )}
            
            <p className="mt-10 text-xl/8 text-muted-foreground">
              {article.description}
            </p>
            
            <div className="mt-10 max-w-2xl">
              {article.content && (
                <article 
                  className="article-content prose prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <section className="border-t bg-muted/30 py-12">
          <div className="section-container">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {articles && articles
                .filter(a => {
                  if (a.id === article.id) return false;
                  const currentCategories = article.article_categories?.map((c: any) => c.category) || [];
                  const relatedCategories = a.article_categories?.map((c: any) => c.category) || [];
                  return currentCategories.some((cat: string) => relatedCategories.includes(cat));
                })
                .slice(0, 3)
                .map(relatedArticle => (
                  <Link 
                    key={relatedArticle.id} 
                    to={`/article/${relatedArticle.slug}`}
                    className="group block border rounded-lg hover:border-primary transition-colors bg-card overflow-hidden"
                  >
                    {relatedArticle.image_url && (
                      <img
                        src={relatedArticle.image_url}
                        alt={relatedArticle.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      {relatedArticle.article_categories?.[0] && (
                        <span className="text-sm font-semibold text-primary">
                          {relatedArticle.article_categories[0].category}
                        </span>
                      )}
                      <h3 className="font-semibold mt-2 mb-2 group-hover:text-primary transition-colors">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relatedArticle.description}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Article;
