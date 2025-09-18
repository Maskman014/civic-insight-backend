import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send } from "lucide-react";
import { Comment, getCommentsByReport, addComment } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface CommentsSectionProps {
  reportId: string;
  reportTitle: string;
  onClose: () => void;
}

export const CommentsSection = ({ reportId, reportTitle, onClose }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
  }, [reportId]);

  const loadComments = async () => {
    try {
      const commentsData = await getCommentsByReport(reportId);
      setComments(commentsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addComment({
        content: newComment,
        report_id: reportId,
        author: 'temp-user-id' // This will be replaced with actual user ID when auth is implemented
      });

      toast({
        title: "Success",
        description: "Comment added successfully"
      });

      setNewComment("");
      loadComments(); // Reload comments
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comments for: {reportTitle}
          </CardTitle>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Adding..." : "Add Comment"}
          </Button>
        </form>

        <Separator />

        {/* Comments List */}
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-muted-foreground text-center">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-muted-foreground text-center">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">User {comment.author?.slice(0, 8)}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-foreground">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};