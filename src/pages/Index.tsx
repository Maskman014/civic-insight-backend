import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, MessageCircle } from "lucide-react";
import { Report, listReports } from "@/services/api";
import { ReportCard } from "@/components/ReportCard";
import { CreateReportForm } from "@/components/CreateReportForm";
import { CommentsSection } from "@/components/CommentsSection";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReportForComments, setSelectedReportForComments] = useState<Report | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const reportsData = await listReports();
      setReports(reportsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportCreated = () => {
    loadReports();
  };

  const handleViewComments = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setSelectedReportForComments(report);
    }
  };

  if (selectedReportForComments) {
    return (
      <div className="container mx-auto py-8">
        <CommentsSection
          reportId={selectedReportForComments.id}
          reportTitle={selectedReportForComments.title}
          onClose={() => setSelectedReportForComments(null)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Reports Dashboard</h1>
        <p className="text-muted-foreground">Manage and track reports efficiently</p>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            All Reports
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                All Reports ({reports.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground">Loading reports...</p>
              ) : reports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No reports found</p>
                  <Button 
                    onClick={() => window.location.hash = '#create'}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Report
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {reports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onViewComments={handleViewComments}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <CreateReportForm onReportCreated={handleReportCreated} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
