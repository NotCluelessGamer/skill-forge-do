import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { ArrowLeft, CheckCircle2, Circle, Sparkles, Loader2 } from "lucide-react"; // Import Loader2
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

  // --- AI Feedback State Variables ---
  const [userInput, setUserInput] = useState('');
  const [feedbackResult, setFeedbackResult] = useState('');
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
  // --- End AI Feedback State ---

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
    setIsLoading(true); // Ensure loading state is true at the start
    setFeedbackResult(''); // Reset feedback on new lesson load
    setUserInput(''); // Reset user input on new lesson load
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
          user_id: user?.id, // Ensure user_id is correctly passed
          lesson_id: lessonId, // Ensure lessonId is correctly passed
        });

      if (error && error.code !== '23505') { // Ignore unique constraint violation if already completed
         throw error;
      }


      setIsCompleted(true);
      toast({
        title: "Lesson completed! 🎉",
        description: "Great job! Keep up the momentum.",
      });

      // Optionally navigate to the next lesson or back to the course
      // navigate(`/course/${lesson?.course_id}`);

    } catch (error: any) {
      // Check if it's a unique constraint violation, meaning already completed
       if (error.code === '23505') {
         setIsCompleted(true); // Mark as completed locally if DB says so
         toast({
           title: "Already completed!",
           description: "This lesson was already marked as complete.",
         });
       } else {
        toast({
          variant: "destructive",
          title: "Error marking as complete",
          description: error.message,
        });
       }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handle AI Feedback Request ---
  const handleGetFeedback = async () => {
    if (!userInput.trim() || !lesson) {
        toast({ variant: "destructive", title: "Input needed", description: "Please enter your work in the text area first."});
        return;
    }
    setIsFetchingFeedback(true);
    setFeedbackResult(''); // Clear previous feedback
    try {
        const response = await fetch('/api/get-feedback', { // Use relative path for Vercel deployment
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                taskDescription: lesson.task_description,
                userInput: userInput,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFeedbackResult(data.feedback);

    } catch (error: any) {
        console.error("Error fetching AI feedback:", error);
        toast({
            variant: "destructive",
            title: "Failed to get AI feedback",
            description: error.message || "An unexpected error occurred.",
        });
        setFeedbackResult('Sorry, could not retrieve feedback at this time.'); // Show error in UI
    } finally {
        setIsFetchingFeedback(false);
    }
  };
  // --- End Handle AI Feedback ---


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Simple loading text instead of skeleton for speed */}
            <p className="text-center text-muted-foreground">Loading lesson...</p>
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
            {/* Lesson Details Card */}
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

            {/* Task Card */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Your Task
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {lesson?.task_description}
                </p>
                {/* --- Textarea for User Input --- */}
                <Textarea
                  placeholder="Paste or type your work here..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="min-h-[150px] text-base" // Make textarea larger and text readable
                />
                 {/* --- End Textarea --- */}
              </CardContent>
            </Card>

             {/* --- Get Feedback Button --- */}
             <Button
                onClick={handleGetFeedback}
                disabled={isFetchingFeedback || !userInput.trim()}
                variant="outline"
                size="lg"
            >
                {isFetchingFeedback ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Getting Feedback...
                    </>
                ) : (
                    'Get AI Feedback'
                )}
            </Button>
            {/* --- End Get Feedback Button --- */}


            {/* AI Feedback Card */}
            <Card className="shadow-medium bg-muted/30">
              <CardHeader>
                <CardTitle>AI Feedback</CardTitle>
                <CardDescription>
                  Get personalized feedback on your work.
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[150px]">
                 {/* --- Feedback Display Logic --- */}
                 {isFetchingFeedback ? (
                    <div className="flex items-center justify-center h-full">
                       <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                       <p className="ml-3 text-muted-foreground">Loading feedback...</p>
                    </div>
                 ) : feedbackResult ? (
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{feedbackResult}</p>
                 ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Submit your work above to get AI feedback.</p>
                    </div>
                 )}
                 {/* --- End Feedback Display --- */}
              </CardContent>
            </Card>

            {/* Mark Complete Button */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleMarkComplete}
                disabled={isCompleted || isSubmitting}
                className="bg-gradient-success hover:opacity-90 text-lg px-8 py-6"
                size="lg"
              >
                {isSubmitting ? (
                   <>
                     <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                     Marking...
                   </>
                ) : isCompleted ? (
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
