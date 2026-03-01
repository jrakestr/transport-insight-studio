import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuroraBackground } from "@/components/AuroraBackground";
import { FlipFadeText } from "@/components/ui/flip-fade-text";
import { PerspectiveGrid } from "@/components/ui/perspective-grid";
import { StaggeredGrid, type BentoItem, type GridImageItem } from "@/components/ui/staggered-grid";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import AnimatedButton from "@/components/ui/animated-button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useArticles } from "@/hooks/useArticles";
import { format } from "date-fns";
import { ArrowRight, Loader2, BarChart3, FileSearch, Building2, MessageSquare, BookOpen, FileText } from "lucide-react";
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
  const gridItems: GridImageItem[] =
    articles && articles.length > 0
      ? articles.slice(0, 5).map((a) => ({
          url: a.image_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%231e293b' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' fill='%2364748b' text-anchor='middle' dominant-baseline='middle' font-size='14'%3EArticle%3C/text%3E%3C/svg%3E",
          slug: a.slug,
        }))
      : [];

  const bentoItems: BentoItem[] =
    articles && articles.length > 0
      ? articles.slice(0, 5).map((a) => ({
          id: a.id,
          title: a.title,
          subtitle: a.category || "",
          description: a.description || "",
          icon: <FileText className="w-4 h-4" />,
          image: a.image_url || undefined,
          slug: a.slug,
        }))
      : [];

  const images = gridItems.length > 0 ? gridItems.map((g) => g.url).filter(Boolean) : [];

  return (
    <SmoothScroll>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden">
          <AuroraBackground />
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
                    Real-time{" "}
                    <FlipFadeText
                      words={["transit", "agency", "procurement", "fleet", "mobility"]}
                      interval={3000}
                      className="inline-flex min-h-0 min-w-[11ch] justify-start"
                      textClassName="text-5xl sm:text-7xl text-[hsl(var(--hero-flip-text))] normal-case"
                    />{" "}
                    news and market insights
                  </h1>
                  <p className="mt-8 text-lg font-medium text-muted-foreground sm:max-w-md sm:text-xl/8 lg:max-w-none">
                    Breaking news, RFP opportunities, and competitive intelligence for transit technology companies. Stay informed with data-driven insights from industry sources across the transportation sector.
                  </p>
                  <div className="mt-10 flex items-center gap-x-6">
                    <AnimatedButton size="lg" asChild>
                      <Link to="/reports">
                        View {reportMonthYear} Data Dispatch
                      </Link>
                    </AnimatedButton>
                    <Link to="/procurement" className="text-sm/6 font-semibold text-foreground hover:text-primary transition-colors">
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

        {/* News Feed - Staggered Grid */}
        <section className="py-8 lg:py-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <StaggeredGrid
              images={images}
              gridItems={gridItems.length > 0 ? gridItems : undefined}
              bentoItems={bentoItems}
              centerText="Latest News"
              showFooter={true}
              credits={{
                madeBy: { text: "transit-track.ai", href: "/" },
                moreDemos: { text: `View ${reportMonthYear} Report`, href: "/reports" },
              }}
            />
          )}
          {!isLoading && articles && articles.length > 0 && (
            <div className="section-container mt-16">
              <div className="max-w-4xl mx-auto p-8 border-2 border-primary/20 rounded-lg bg-primary/5">
                <h3 className="text-2xl font-bold mb-4">Want the Complete {reportMonthYear} Data Dispatch?</h3>
                <p className="text-muted-foreground mb-6">
                  Access a comprehensive analysis covering transit expansions, trend adoption, RFP opportunities, and
                  competitive intelligence across the transit sector.
                </p>
                <AnimatedButton size="lg" asChild>
                  <Link to="/reports">
                    View Full Report
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </AnimatedButton>
              </div>
            </div>
          )}
        </section>

        {/* Explore Section - Perspective Grid + Feature Cards */}
        <section className="relative min-h-[500px] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <PerspectiveGrid
              className="bg-background [--fade-stop:hsl(var(--background))]"
              gridSize={40}
              showOverlay={true}
              fadeRadius={80}
            />
          </div>
          <div className="relative z-20 flex items-center justify-center py-16 lg:py-24 pointer-events-none">
            <div className="section-container pointer-events-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Explore more</h2>
                <p className="text-lg text-muted-foreground">
                  Data-driven tools and insights for transit technology professionals.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
                <Link to="/reports">
                  <Card className="h-full border-border/80 bg-card/95 backdrop-blur hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <BarChart3 className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-lg">Data Dispatch</CardTitle>
                      <CardDescription>
                        Monthly reports on transit expansions, trends, and market intelligence.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <Link to="/procurement">
                  <Card className="h-full border-border/80 bg-card/95 backdrop-blur hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <FileSearch className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-lg">Procurement</CardTitle>
                      <CardDescription>
                        Discover RFPs, bids, and procurement opportunities from transit agencies.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <Link to="/agencies">
                  <Card className="h-full border-border/80 bg-card/95 backdrop-blur hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <Building2 className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-lg">Transit Agencies</CardTitle>
                      <CardDescription>
                        Browse profiles of transit agencies across the United States.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <Link to="/chat">
                  <Card className="h-full border-border/80 bg-card/95 backdrop-blur hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <MessageSquare className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-lg">AI Chat</CardTitle>
                      <CardDescription>
                        Ask questions about transit data, agencies, and market insights.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <Link to="/playbook">
                  <Card className="h-full border-border/80 bg-card/95 backdrop-blur hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <BookOpen className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-lg">Sales Playbooks</CardTitle>
                      <CardDescription>
                        Strategic frameworks for winning transit technology deals.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </section>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
};

export default Index;
