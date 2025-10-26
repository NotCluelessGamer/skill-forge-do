import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  full_name: string;
  created_at: string;
}

interface Stats {
  totalLessons: number;
  completedLessons: number;
  coursesStarted: number;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ totalLessons: 0, completedLessons: 0, coursesStarted: 0 });
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
  }, [navigate]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      const { data: progressData } = await supabase
        .from("user_progress")
        .select("lesson_id")
        .eq("user_id", user?.id);

      const { count: totalLessons } = await supabase
        .from("lessons")
        .select("*", { count: "exact", head: true });

      const completedLessonIds = progressData?.map(p => p.lesson_id) || [];
      
      const { data: coursesData } = await supabase
        .from("lessons")
        .select("course_id")
        .in("id", completedLessonIds);

      const uniqueCourses = new Set(coursesData?.map(l => l.course_id) || []);

      setProfile(profileData);
      setStats({
        totalLessons: totalLessons || 0,
        completedLessons: completedLessonIds.length,
        coursesStarted: uniqueCourses.size,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading profile",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = stats.totalLessons > 0 
    ? Math.round((stats.completedLessons / stats.totalLessons) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-6">
              <div className="h-48 bg-muted animate-pulse rounded-xl" />
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
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
          <Card className="shadow-strong mb-8 bg-gradient-card animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-hero rounded-full">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl">{profile?.full_name || "Learner"}</CardTitle>
                  <CardDescription className="text-base">
                    Member since {new Date(profile?.created_at || "").toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="mb-8 animate-slide-up">
            <h2 className="text-2xl font-bold mb-4">Overall Progress</h2>
            <Card className="shadow-medium">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Lessons Completed</span>
                  <span className="text-2xl font-bold text-primary">{progress}%</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-success transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.completedLessons} of {stats.totalLessons} lessons completed
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8 animate-scale-in">
            <h2 className="text-2xl font-bold mb-4">Your Stats</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-medium hover:shadow-strong transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Courses Started</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-primary">{stats.coursesStarted}</p>
                </CardContent>
              </Card>

              <Card className="shadow-medium hover:shadow-strong transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <Award className="h-6 w-6 text-success" />
                    </div>
                    <CardTitle className="text-lg">Lessons Done</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-success">{stats.completedLessons}</p>
                </CardContent>
              </Card>

              <Card className="shadow-medium hover:shadow-strong transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <Trophy className="h-6 w-6 text-secondary" />
                    </div>
                    <CardTitle className="text-lg">Completion</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-secondary">{progress}%</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="shadow-medium animate-fade-in">
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Your learning milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {stats.completedLessons >= 1 && (
                  <Badge variant="secondary" className="px-4 py-2 text-sm">
                    🎯 First Lesson
                  </Badge>
                )}
                {stats.completedLessons >= 5 && (
                  <Badge variant="secondary" className="px-4 py-2 text-sm">
                    🔥 5 Lessons
                  </Badge>
                )}
                {stats.coursesStarted >= 1 && (
                  <Badge variant="secondary" className="px-4 py-2 text-sm">
                    📚 Course Starter
                  </Badge>
                )}
                {stats.completedLessons >= 10 && (
                  <Badge variant="secondary" className="px-4 py-2 text-sm">
                    ⭐ 10 Lessons
                  </Badge>
                )}
                {progress >= 50 && (
                  <Badge variant="secondary" className="px-4 py-2 text-sm">
                    🏆 Halfway There
                  </Badge>
                )}
                {stats.completedLessons === 0 && (
                  <p className="text-muted-foreground">Complete lessons to earn achievements!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
