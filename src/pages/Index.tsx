import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { articles } from "@/data/articles";
import { ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="section-container relative py-16 lg:py-24">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="mb-4">
                Transportation Industry Market Intelligence
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Latest Transit Technology <span className="text-primary">News & Analysis</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Breaking news, RFP opportunities, and competitive intelligence for transit technology companies. Stay informed with data-driven insights from industry sources.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/report">
                    View October 2025 Report
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* News Feed */}
        <section className="py-16 lg:py-24">
          <div className="section-container">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12">
                <h2 className="text-4xl font-bold mb-4">Latest Industry News</h2>
                <p className="text-lg text-muted-foreground">
                  Breaking developments in transit technology, policy, and market intelligence.
                </p>
              </div>
              
              <div className="space-y-8 border-t border-border pt-10">
                {articles.map((article) => (
                  <article 
                    key={article.id} 
                    className="border border-border rounded-lg overflow-hidden hover:border-primary transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Article Image */}
                      {article.imageUrl && (
                        <div className="lg:w-80 shrink-0">
                          <Link to={`/article/${article.slug}`}>
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-full h-48 lg:h-full object-cover hover:opacity-90 transition-opacity"
                            />
                          </Link>
                        </div>
                      )}
                      
                      <div className="p-6 flex-1">
                        {/* Author Info */}
                        <div className="flex space-x-3 mb-4">
                          <Avatar className="size-10">
                            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                              JR
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">
                              {article.author.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <time dateTime={article.datetime}>{article.date}</time>
                              {' · '}
                              <span>{article.author.role}</span>
                            </p>
                          </div>
                        </div>

                        {/* Article Content */}
                        <div className="mb-3">
                          <Badge variant="outline">{article.category.title}</Badge>
                        </div>
                        
                        <div className="group">
                          <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                            <Link to={`/article/${article.slug}`}>
                              {article.title}
                            </Link>
                          </h3>
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {article.description}
                          </p>
                          <Link to={`/article/${article.slug}`}>
                            <Button variant="ghost" size="sm">
                              Read Full Article
                              <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* View Full Report CTA */}
              <div className="mt-16 p-8 border-2 border-primary/20 rounded-lg bg-primary/5">
                <h3 className="text-2xl font-bold mb-4">
                  Want the Complete October 2025 Market Intelligence Report?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Access our comprehensive 42-minute analysis covering microtransit expansion, electric vehicle adoption, RFP opportunities, and competitive intelligence across the transit sector.
                </p>
                <Link to="/report">
                  <Button size="lg">
                    View Full Report
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
