import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, ExternalLink, CheckCircle, Info } from "lucide-react";
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

        {/* Article Content - Exact Template */}
        <div className="bg-background px-6 py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-base/7 text-muted-foreground">
            {article.category && (
              <p className="text-base/7 font-semibold text-primary">
                {article.category}
              </p>
            )}
            
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl">
              {article.title}
            </h1>
            
            <p className="mt-6 text-xl/8">
              {article.description}
            </p>
            
            <div className="mt-10 max-w-2xl text-muted-foreground">
              {article.content && (
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              )}
              
              <ul role="list" className="mt-8 max-w-xl space-y-8 text-muted-foreground">
                <li className="flex gap-x-3">
                  <CheckCircle
                    aria-hidden="true"
                    className="mt-1 size-5 flex-none text-primary"
                  />
                  <span>
                    <strong className="font-semibold text-foreground">Industry Leading Coverage.</strong> Comprehensive reporting on transit technology developments, market trends, and regulatory changes affecting the transportation sector.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <CheckCircle
                    aria-hidden="true"
                    className="mt-1 size-5 flex-none text-primary"
                  />
                  <span>
                    <strong className="font-semibold text-foreground">Real-Time Updates.</strong> Stay informed with breaking news and immediate updates on major transit projects, RFPs, and contract awards.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <CheckCircle
                    aria-hidden="true"
                    className="mt-1 size-5 flex-none text-primary"
                  />
                  <span>
                    <strong className="font-semibold text-foreground">Expert Analysis.</strong> In-depth market intelligence and competitive insights to help you make informed business decisions.
                  </span>
                </li>
              </ul>
              
              <p className="mt-8">
                {article.source_url && (
                  <a 
                    href={article.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Read the original article{article.source_name && ` from ${article.source_name}`}
                  </a>
                )}
              </p>
              
              <h2 className="mt-16 text-3xl font-semibold tracking-tight text-pretty text-foreground">
                Transit Technology Insights
              </h2>
              
              <p className="mt-6">
                Our comprehensive coverage includes paratransit solutions, demand response technology, fleet management systems, and the latest innovations in public transportation. We track major transit agencies, technology providers, and emerging market opportunities across North America.
              </p>
              
              {article.author_name && (
                <figure className="mt-10 border-l border-primary pl-9">
                  <blockquote className="font-semibold text-foreground">
                    <p>
                      "Stay ahead of the competition with real-time intelligence on transit technology procurement, implementation, and performance across major metropolitan areas."
                    </p>
                  </blockquote>
                  <figcaption className="mt-6 flex gap-x-4">
                    <div className="size-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                      {article.author_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="text-sm/6">
                      <strong className="font-semibold text-foreground">{article.author_name}</strong>
                      {article.author_role && ` – ${article.author_role}`}
                    </div>
                  </figcaption>
                </figure>
              )}
              
              <p className="mt-10">
                Published on {format(new Date(article.published_at), 'MMMM d, yyyy')}, this article provides essential insights for transit professionals, technology vendors, and industry stakeholders.
              </p>
            </div>
            
            {article.image_url && (
              <figure className="mt-16">
                <img
                  alt={article.title}
                  src={article.image_url}
                  className="aspect-video rounded-xl bg-muted object-cover"
                />
                <figcaption className="mt-4 flex gap-x-2 text-sm/6 text-muted-foreground">
                  <Info
                    aria-hidden="true"
                    className="mt-0.5 size-5 flex-none text-muted-foreground/50"
                  />
                  {article.title}
                </figcaption>
              </figure>
            )}
            
            <div className="mt-16 max-w-2xl text-muted-foreground">
              <h2 className="text-3xl font-semibold tracking-tight text-pretty text-foreground">
                Everything you need to stay informed
              </h2>
              
              <p className="mt-6">
                TransitIntel delivers comprehensive market intelligence, tracking transit agencies, paratransit operators, NEMT providers, and technology vendors. Our platform aggregates news, RFPs, contract awards, and industry developments to give you a complete picture of the transit technology landscape.
              </p>
              
              <p className="mt-8">
                From AI-powered scheduling systems to electric vehicle deployments, we cover the innovations transforming public transportation. Whether you're tracking opportunities with major agencies like MTA, CTA, or regional operators, TransitIntel provides the competitive intelligence you need.
              </p>
            </div>
          </div>
        </div>

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
                      {relatedArticle.category && (
                        <span className="text-sm font-semibold text-primary">{relatedArticle.category}</span>
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
