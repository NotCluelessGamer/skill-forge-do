import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimated_hours: number;
}

const Category = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
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
  }, [categoryId, navigate]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("id", categoryId)
        .single();

      if (categoryError) throw categoryError;

      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .eq("category_id", categoryId);

      if (coursesError) throw coursesError;

      // Calculate progress for each course
      const progressData: { [key: string]: number } = {};
      
      for (const course of coursesData || []) {
        const { data: lessons } = await supabase
          .from("lessons")
          .select("id")
          .eq("course_id", course.id);

        const { data: completedLessons } = await supabase
          .from("user_progress")
          .select("lesson_id")
          .eq("user_id", user?.id)
          .in("lesson_id", lessons?.map(l => l.id) || []);

        const total = lessons?.length || 0;
        const completed = completedLessons?.length || 0;
        progressData[course.id] = total > 0 ? Math.round((completed / total) * 100) : 0;
      }

      setCategory(categoryData);
      setCourses(coursesData || []);
      setProgress(progressData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading courses",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="container mx-auto">
            <div className="h-12 w-64 bg-muted animate-pulse rounded mb-8" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
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
        <div className="container mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {category?.name}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              {category?.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                difficulty={course.difficulty}
                estimatedHours={course.estimated_hours}
                progress={progress[course.id] || 0}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Category;
