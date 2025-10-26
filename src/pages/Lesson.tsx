import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  task_description: string;
  order_index: number;
}

const Lesson = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchData();
    };

    checkAuth();
  }, [lessonId, navigate]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      if (lessonError) throw lessonError;

      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user?.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      setLesson(lessonData);
      setIsCompleted(!!progressData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading lesson",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (isCompleted) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("user_progress")
        .insert({
          user_id: user?.id,
          lesson_id: lessonId,
        });

      if (error) throw error;

      setIsCompleted(true);
      toast({
        title: "Lesson completed! 🎉",
        description: "Great job! Keep up the momentum.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error marking as complete",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="h-12 w-64 bg-muted animate-pulse rounded mb-8" />
            <div className="space-y-6">
              <div className="h-64 bg-muted animate-pulse rounded-xl" />
              <div className="h-64 bg-muted animate-pulse rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link to={`/course/${lesson?.course_id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Link>
          </Button>

          <div className="space-y-6 animate-fade-in">
            <Card className="shadow-medium">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-3xl mb-2">{lesson?.title}</CardTitle>
                    <CardDescription className="text-lg">
                      {lesson?.description}
                    </CardDescription>
                  </div>
                  {isCompleted && (
                    <CheckCircle2 className="h-8 w-8 text-success flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
            </Card>

            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Your Task
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {lesson?.task_description}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-medium bg-muted/30">
              <CardHeader>
                <CardTitle>AI Feedback</CardTitle>
                <CardDescription>
                  Connect to AI later for personalized feedback on your work
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>AI feedback feature coming soon!</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={handleMarkComplete}
                disabled={isCompleted || isSubmitting}
                className="bg-gradient-success hover:opacity-90 text-lg px-8 py-6"
                size="lg"
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Completed
                  </>
                ) : (
                  "Mark as Complete"
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lesson;
