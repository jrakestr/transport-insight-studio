import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { useArticles } from "@/hooks/useArticles";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

        {/* Article Header */}
        <section className="border-b bg-muted/30">
          {/* Article Image */}
          {article.image_url && (
            <div className="w-full h-96 overflow-hidden">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="section-container py-12 lg:py-16">
            <div className="max-w-4xl">
              {article.category && (
                <Badge variant="secondary" className="mb-4">
                  {article.category}
                </Badge>
              )}
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {article.title}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                    {article.author_name ? article.author_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'TT'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{article.author_name || 'Transit Technologies'}</div>
                  {article.author_role && (
                    <div className="text-sm text-muted-foreground">{article.author_role}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={article.published_at}>
                    {format(new Date(article.published_at), 'MMMM d, yyyy')}
                  </time>
                </div>
                {article.source_url && (
                  <a 
                    href={article.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Original Source{article.source_name && ` (${article.source_name})`}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12 lg:py-20">
          <div className="section-container">
            <div className="max-w-4xl mx-auto">
              <article className="article-content">
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  {article.description}
                </p>
                
                {article.content && (
                  <div 
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                )}
              </article>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        <section className="border-t bg-muted/30 py-12">
          <div className="section-container">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {articles && articles
                .filter(a => a.id !== article.id && article.category && a.category === article.category)
                .slice(0, 3)
                .map(relatedArticle => (
                  <Link 
                    key={relatedArticle.id} 
                    to={`/article/${relatedArticle.slug}`}
                    className="block border rounded-lg hover:border-primary transition-colors bg-card overflow-hidden"
                  >
                    {relatedArticle.image_url && (
                      <img
                        src={relatedArticle.image_url}
                        alt={relatedArticle.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      {relatedArticle.category && (
                        <Badge variant="outline" className="mb-2">{relatedArticle.category}</Badge>
                      )}
                      <h3 className="font-semibold mb-2 hover:text-primary transition-colors">
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
