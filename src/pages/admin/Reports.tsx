import { Link } from "react-router-dom";
import { useReports, useReportMutation } from "@/hooks/useReports";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function ReportsAdmin() {
  const { data: reports, isLoading } = useReports();
  const { deleteReport } = useReportMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Button asChild>
          <Link to="/admin/reports/new">
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {reports?.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Published: {format(new Date(report.published_at), "MMM d, yyyy")}</span>
                    {report.read_time && <span>Read time: {report.read_time}</span>}
                    <span>Slug: {report.slug}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/reports/${report.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this report?")) {
                        deleteReport.mutate(report.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {reports?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No reports yet. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
}
