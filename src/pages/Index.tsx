import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, TrendingUp, FileText, Building2, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const featuredReport = {
    title: "Transportation Industry Market Intelligence Report",
    date: "October 2025",
    readTime: "42 min read",
    excerpt: "Comprehensive analysis covering microtransit expansion, electric vehicle adoption, and technology integration across transit sectors.",
    categories: ["Market Intelligence", "Industry Analysis"]
  };

  const latestNews = [
    {
      title: "MARTA Completes $850M Fare Collection System Modernization",
      date: "Nov 3, 2025",
      category: "Technology",
      excerpt: "Complete replacement of fare collection infrastructure includes new Breeze cards, mobile app, and contactless payment across all stations."
    },
    {
      title: "Denver RTD Launches Detective Bureau for Transit Crime Investigation",
      date: "Oct 30, 2025",
      category: "Safety & Security",
      excerpt: "New in-house investigation capability covers 8 counties, reducing reliance on local police departments."
    },
    {
      title: "Autocab + zTrip Partnership Powers 3,600 Vehicles Across 20 States",
      date: "Oct 28, 2025",
      category: "Partnerships",
      excerpt: "Landmark technology integration brings NTEP-certified soft meters to largest U.S. taxi fleet operator."
    },
    {
      title: "Illinois Passes $1.5B Transit Funding Bill, Avoiding Fiscal Cliff",
      date: "Oct 31, 2025",
      category: "Policy & Funding",
      excerpt: "Legislative package saves CTA, Metra, and Pace from severe service cuts without new taxes."
    }
  ];

  const keyMetrics = [
    { icon: TrendingUp, label: "Active RFPs", value: "47", change: "+12% MoM" },
    { icon: FileText, label: "Market Reports", value: "150+", change: "Published" },
    { icon: Building2, label: "Agencies Tracked", value: "500+", change: "Nationwide" },
    { icon: Zap, label: "AI-Powered Insights", value: "Real-time", change: "24/7" }
  ];

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
                Trusted by 200+ Transit Technology Companies
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Transportation Industry <span className="text-primary">Market Intelligence</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Comprehensive analysis of transit technology markets, RFPs, competitive intelligence, and industry trends. Make informed decisions with data-driven insights.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/report">
                    View Latest Report
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline">
                  Subscribe to Insights
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Bar */}
        <section className="border-b bg-muted/30">
          <div className="section-container py-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {keyMetrics.map((metric, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <metric.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                    <div className="text-xs text-primary">{metric.change}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Report */}
        <section id="reports" className="py-16 lg:py-20">
          <div className="section-container">
            <div className="mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Featured Market Report</h2>
              <p className="text-lg text-muted-foreground">In-depth analysis of October 2025 transit industry developments</p>
            </div>

            <Card className="overflow-hidden border-2 hover:border-primary transition-colors">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {featuredReport.categories.map((cat, idx) => (
                    <Badge key={idx} variant="secondary">{cat}</Badge>
                  ))}
                </div>
                <CardTitle className="text-3xl mb-3">{featuredReport.title}</CardTitle>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>{featuredReport.date}</span>
                  <span>•</span>
                  <span>{featuredReport.readTime}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-lg mb-6">{featuredReport.excerpt}</p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild>
                    <Link to="/report">
                      Read Full Report
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline">
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Latest News */}
        <section id="news" className="py-16 lg:py-20 bg-muted/30">
          <div className="section-container">
            <div className="mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Latest Industry News</h2>
              <p className="text-lg text-muted-foreground">Breaking developments in transit technology and infrastructure</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {latestNews.map((article, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <Badge variant="outline">{article.category}</Badge>
                      <span className="text-sm text-muted-foreground">{article.date}</span>
                    </div>
                    <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{article.excerpt}</p>
                    <Button variant="ghost" size="sm">
                      Read More
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* RFP Section */}
        <section id="rfps" className="py-16 lg:py-20">
          <div className="section-container">
            <div className="mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Active RFP Opportunities</h2>
              <p className="text-lg text-muted-foreground">Current procurement opportunities in the transit sector</p>
            </div>

            <div className="space-y-4">
              {[
                { agency: "KCATA (Kansas City)", project: "Fare Payment System Project", value: "$15-30M est.", deadline: "Dec 15, 2025" },
                { agency: "Denver RTD", project: "47 Articulated 60' Buses for BRT", value: "$40-50M est.", deadline: "Dec 1, 2025" },
                { agency: "Maryland DOH", project: "Statewide NEMT Administrator", value: "Multi-year", deadline: "Nov 30, 2025" },
                { agency: "Tri Delta Transit", project: "Transit Operations Contract", value: "Multi-year", deadline: "Nov 20, 2025" }
              ].map((rfp, idx) => (
                <Card key={idx} className="hover:border-primary transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{rfp.project}</h3>
                        <p className="text-muted-foreground">{rfp.agency}</p>
                      </div>
                      <div className="flex flex-wrap gap-4 lg:gap-8 items-center">
                        <div>
                          <div className="text-sm text-muted-foreground">Estimated Value</div>
                          <div className="font-semibold">{rfp.value}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Deadline</div>
                          <div className="font-semibold">{rfp.deadline}</div>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 lg:py-20 bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <div className="section-container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Stay Ahead of Transit Technology Trends
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Get weekly market intelligence, RFP alerts, and competitive analysis delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-md px-4 py-3 text-foreground"
                />
                <Button variant="secondary" size="lg">
                  Subscribe
                </Button>
              </div>
              <p className="text-sm mt-4 opacity-75">Join 5,000+ transit professionals receiving our insights</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
