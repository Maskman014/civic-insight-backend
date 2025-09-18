import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, MapPin, Clock } from "lucide-react";
import { Report } from "@/services/api";

interface ReportCardProps {
  report: Report;
  onViewComments: (reportId: string) => void;
}

export const ReportCard = ({ report, onViewComments }: ReportCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-destructive text-destructive-foreground';
      case 'in_progress':
        return 'bg-accent text-accent-foreground';
      case 'resolved':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{report.title}</CardTitle>
          <Badge className={getStatusColor(report.status)}>
            {report.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{report.description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {report.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{report.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{new Date(report.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewComments(report.id)}
          className="flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          View Comments
        </Button>
      </CardFooter>
    </Card>
  );
};