import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  category_id: string;
  title: string;
  description: string;
  difficulty: string;
  estimated_hours: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  order_index: number;
}

const Course = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
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
  }, [courseId, navigate]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index");

      if (lessonsError) throw lessonsError;

      const { data: progressData } = await supabase
        .from("user_progress")
        .select("lesson_id")
        .eq("user_id", user?.id)
        .in("lesson_id", lessonsData?.map(l => l.id) || []);

      setCourse(courseData);
      setLessons(lessonsData || []);
      setCompletedLessons(new Set(progressData?.map(p => p.lesson_id) || []));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading course",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = lessons.length > 0 
    ? Math.round((completedLessons.size / lessons.length) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="h-12 w-64 bg-muted animate-pulse rounded mb-8" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
              ))}
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
            <Link to={`/category/${course?.category_id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Link>
          </Button>

          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold">{course?.title}</h1>
              <Badge variant="outline" className="text-base px-4 py-1">
                {course?.difficulty}
              </Badge>
            </div>
            <p className="text-xl text-muted-foreground mb-6">
              {course?.description}
            </p>
            
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm text-muted-foreground">
                {completedLessons.size} / {lessons.length} lessons completed
              </span>
              <span className="text-sm font-semibold text-primary">{progress}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-success transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-4 animate-fade-in">
            {lessons.map((lesson, index) => {
              const isCompleted = completedLessons.has(lesson.id);
              
              return (
                <Card
                  key={lesson.id}
                  className={`hover:shadow-medium transition-all duration-300 cursor-pointer ${
                    isCompleted ? "border-success/50 bg-success/5" : ""
                  }`}
                  onClick={() => navigate(`/lesson/${lesson.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-success" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          Lesson {index + 1}: {lesson.title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {lesson.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Course;
