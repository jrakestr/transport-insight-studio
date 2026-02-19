import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Calendar, Clock, Download, Share2 } from "lucide-react";
import { useReports } from "@/hooks/useReports";
import { format } from "date-fns";
import DOMPurify from "dompurify";

const ReportDetail = () => {
  const { slug } = useParams();
  const { data: reports, isLoading } = useReports();
  const report = reports?.find(r => r.slug === slug);

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

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Report Not Found</h1>
            <Link to="/reports">
              <Button>View All Reports</Button>
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
            <Link to="/reports">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Reports
              </Button>
            </Link>
          </div>
        </section>

        {/* Report Header */}
        <section className="bg-gradient-to-b from-muted/50 to-background">
          <div className="section-container py-16 lg:py-24">
            <div className="max-w-4xl">
              <div className="mb-6">
                <Badge className="text-sm font-semibold">Market Intelligence Report</Badge>
              </div>
              
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                {report.title}
              </h1>
              
              {report.description && (
                <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
                  {report.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(report.published_at), 'MMMM d, yyyy')}</span>
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

              <div className="flex gap-3">
                <Button size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Report Content - Rich Layout */}
        <div className="bg-background px-6 py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-base/7 text-foreground">
            {report.image_url && (
              <figure className="mb-10">
                <img
                  alt={report.title}
                  src={report.image_url}
                  className="aspect-video rounded-xl bg-muted object-cover w-full"
                />
              </figure>
            )}
            
            <div className="max-w-2xl">
              {report.content ? (
                <article 
                  className="article-content prose prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(report.content) }}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Report content coming soon.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Reports */}
        <section className="border-t bg-muted/30 py-12">
          <div className="section-container">
            <h2 className="text-2xl font-bold mb-6">More Reports</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {reports && reports
                .filter(r => r.id !== report.id)
                .slice(0, 3)
                .map(relatedReport => (
                  <Link 
                    key={relatedReport.id} 
                    to={`/reports/${relatedReport.slug}`}
                    className="group block border rounded-lg hover:border-primary transition-colors bg-card overflow-hidden"
                  >
                    {relatedReport.image_url && (
                      <img
                        src={relatedReport.image_url}
                        alt={relatedReport.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <Badge variant="secondary" className="mb-2">Report</Badge>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        {relatedReport.title}
                      </h3>
                      {relatedReport.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedReport.description}
                        </p>
                      )}
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

export default ReportDetail;
