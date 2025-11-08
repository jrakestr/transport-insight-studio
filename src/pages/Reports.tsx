import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useReports } from "@/hooks/useReports";
import { ArrowRight, Loader2, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const Reports = () => {
  const { data: reports, isLoading } = useReports();

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
                Market Intelligence Reports
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Transit Industry <span className="text-primary">Data Dispatch</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Comprehensive monthly analysis covering RFP opportunities, industry trends, and competitive intelligence for transit technology companies.
              </p>
            </div>
          </div>
        </section>

        {/* Reports Grid */}
        <section className="py-16 lg:py-24">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="mb-12">
                <h2 className="text-4xl font-bold mb-4">Available Reports</h2>
                <p className="text-lg text-muted-foreground">
                  Deep-dive analysis and market intelligence from transit industry sources.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {isLoading ? (
                  <div className="col-span-2 flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <Card 
                      key={report.id} 
                      className="border border-border hover:border-primary transition-colors overflow-hidden"
                    >
                      {report.image_url && (
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={report.image_url}
                            alt={report.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20" />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="mb-3">
                          <Badge>Market Intelligence</Badge>
                        </div>
                        
                        <h3 className="text-2xl font-semibold mb-3">
                          <Link 
                            to={`/reports/${report.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {report.title}
                          </Link>
                        </h3>

                        {report.description && (
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {report.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(report.published_at), 'MMM d, yyyy')}</span>
                          </div>
                          {report.read_time && (
                            <>
                              <span className="text-muted-foreground/40">•</span>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{report.read_time}</span>
                              </div>
                            </>
                          )}
                        </div>

                        <Link to={`/reports/${report.slug}`}>
                          <Button variant="ghost" size="sm">
                            Read Report
                            <ArrowRight className="ml-2 h-3 w-3" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 text-muted-foreground">
                    No reports available at this time.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Reports;
