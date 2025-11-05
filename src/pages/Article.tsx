import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import { articles } from "@/data/articles";

const Article = () => {
  const { slug } = useParams();
  const article = articles.find(a => a.slug === slug);

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
          <div className="section-container py-12 lg:py-16">
            <div className="max-w-4xl">
              <Badge variant="secondary" className="mb-4">
                {article.category.title}
              </Badge>
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {article.title}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <img
                  alt={article.author.name}
                  src={article.author.imageUrl}
                  className="size-12 rounded-full bg-muted"
                />
                <div>
                  <div className="font-semibold">{article.author.name}</div>
                  <div className="text-sm text-muted-foreground">{article.author.role}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <time dateTime={article.datetime}>{article.date}</time>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12 lg:py-20">
          <div className="section-container">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-muted-foreground mb-8 lead">
                  {article.description}
                </p>
                
                <div 
                  className="article-content"
                  dangerouslySetInnerHTML={{ 
                    __html: article.content.split('\n').map(line => {
                      if (line.startsWith('## ')) {
                        return `<h2>${line.substring(3)}</h2>`;
                      } else if (line.startsWith('**') && line.endsWith('**')) {
                        return `<h3>${line.substring(2, line.length - 2)}</h3>`;
                      } else if (line.startsWith('- ')) {
                        return `<li>${line.substring(2)}</li>`;
                      } else if (line.trim() === '') {
                        return '';
                      } else {
                        return `<p>${line}</p>`;
                      }
                    }).join('')
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        <section className="border-t bg-muted/30 py-12">
          <div className="section-container">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {articles
                .filter(a => a.id !== article.id && a.category.title === article.category.title)
                .slice(0, 3)
                .map(relatedArticle => (
                  <Link 
                    key={relatedArticle.id} 
                    to={`/article/${relatedArticle.slug}`}
                    className="block p-4 border rounded-lg hover:border-primary transition-colors bg-card"
                  >
                    <Badge variant="outline" className="mb-2">{relatedArticle.category.title}</Badge>
                    <h3 className="font-semibold mb-2 hover:text-primary transition-colors">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {relatedArticle.description}
                    </p>
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
