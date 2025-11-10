import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useArticles } from "@/hooks/useArticles";
import { ArrowRight, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import electricBus from "@/assets/electric-bus.jpg";
import autonomousVehicle from "@/assets/autonomous-vehicle.jpg";
import contactlessPayment from "@/assets/contactless-payment.jpg";
import chicagoCta from "@/assets/chicago-cta-train.jpg";
import technologyDashboard from "@/assets/technology-dashboard.jpg";

const Index = () => {
  const { data: articles, isLoading } = useArticles();
  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  const reportMonthYear = format(previousMonth, "MMMM yyyy");
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden">
          <svg aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[64rem] w-full [mask-image:radial-gradient(32rem_32rem_at_center,white,transparent)] stroke-border">
            <defs>
              <pattern id="transit-grid" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
                <path d="M.5 200V.5H200" fill="none" />
              </pattern>
            </defs>
            <svg x="50%" y="-1" className="overflow-visible fill-muted/50">
              <path d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z" strokeWidth="0" />
            </svg>
            <rect width="100%" height="100%" fill="url(#transit-grid)" strokeWidth="0" />
          </svg>
          <div aria-hidden="true" className="absolute top-0 right-0 left-1/2 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48">
            <div style={{ clipPath: "polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)" }} className="aspect-[801/1036] w-[50.0625rem] bg-gradient-to-tr from-primary to-accent opacity-20"></div>
          </div>
          <div className="overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 sm:pt-32 lg:px-8 lg:pt-24">
              <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative w-full lg:max-w-xl lg:shrink-0 xl:max-w-2xl">
                  <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
                    Real-time transit news and market insights
                  </h1>
                  <p className="mt-8 text-lg font-medium text-muted-foreground sm:max-w-md sm:text-xl/8 lg:max-w-none">
                    Breaking news, RFP opportunities, and competitive intelligence for transit technology companies. Stay informed with data-driven insights from industry sources across the transportation sector.
                  </p>
                  <div className="mt-10 flex items-center gap-x-6">
                    <Button size="lg" asChild>
                      <Link to="/reports">
                        View {reportMonthYear} Report
                      </Link>
                    </Button>
                    <Link to="/opportunities" className="text-sm/6 font-semibold text-foreground hover:text-primary transition-colors">
                      Browse Opportunities <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
                <div className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
                  <div className="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-none xl:pt-80">
                    <div className="relative">
                      <img src={electricBus} alt="Electric bus technology" className="aspect-[2/3] w-full rounded-xl bg-muted object-cover shadow-lg" />
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-border ring-inset"></div>
                    </div>
                  </div>
                  <div className="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
                    <div className="relative">
                      <img src={autonomousVehicle} alt="Autonomous transit vehicle" className="aspect-[2/3] w-full rounded-xl bg-muted object-cover shadow-lg" />
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-border ring-inset"></div>
                    </div>
                    <div className="relative">
                      <img src={contactlessPayment} alt="Contactless payment system" className="aspect-[2/3] w-full rounded-xl bg-muted object-cover shadow-lg" />
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-border ring-inset"></div>
                    </div>
                  </div>
                  <div className="w-44 flex-none space-y-8 pt-32 sm:pt-0">
                    <div className="relative">
                      <img src={chicagoCta} alt="Chicago CTA train" className="aspect-[2/3] w-full rounded-xl bg-muted object-cover shadow-lg" />
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-border ring-inset"></div>
                    </div>
                    <div className="relative">
                      <img src={technologyDashboard} alt="Transit technology dashboard" className="aspect-[2/3] w-full rounded-xl bg-muted object-cover shadow-lg" />
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-border ring-inset"></div>
                    </div>
                  </div>
                </div>
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : articles && articles.length > 0 ? (
                  articles.map((article) => (
                    <article
                      key={article.id}
                      className="border border-border rounded-lg overflow-hidden hover:border-primary transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Article Image */}
                        {article.image_url && (
                          <div className="lg:w-80 shrink-0">
                            <Link to={`/article/${article.slug}`}>
                              <img
                                src={article.image_url}
                                alt={article.title}
                                className="w-full h-48 lg:h-full object-cover hover:opacity-90 transition-opacity"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            </Link>
                          </div>
                        )}

                        <div className="p-6 flex-1">
                          {/* Author Info */}
                          <div className="flex space-x-3 mb-4">
                            <Avatar className="size-10">
                              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                {article.author_name
                                  ? article.author_name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                  : "TT"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold">{article.author_name || "Transit Technologies"}</p>
                              <p className="text-sm text-muted-foreground">
                                <time dateTime={article.published_at}>
                                  {format(new Date(article.published_at), "MMM d, yyyy")}
                                </time>
                                {article.author_role && (
                                  <>
                                    {" · "}
                                    <span>{article.author_role}</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Article Content */}
                          {article.category && (
                            <div className="mb-3">
                              <Badge variant="outline">{article.category}</Badge>
                            </div>
                          )}

                          <div className="group">
                            <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                              <Link to={`/article/${article.slug}`}>{article.title}</Link>
                            </h3>
                            <p className="text-muted-foreground mb-4 line-clamp-3">{article.description}</p>
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
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">No articles published yet.</div>
                )}
              </div>

              {/* View Full Report CTA */}
              <div className="mt-16 p-8 border-2 border-primary/20 rounded-lg bg-primary/5">
                <h3 className="text-2xl font-bold mb-4">Want the Complete {reportMonthYear} Data Dispatch?</h3>
                <p className="text-muted-foreground mb-6">
                  Access a comprehensive analysis covering transit expansions, trend adoption, RFP opportunities, and
                  competitive intelligence across the transit sector.
                </p>
                <Link to="/reports">
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
