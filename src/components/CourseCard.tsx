import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedHours: number;
  progress?: number;
}

const difficultyColors = {
  Beginner: "bg-success text-success-foreground",
  Intermediate: "bg-secondary text-secondary-foreground",
  Advanced: "bg-destructive text-destructive-foreground",
};

export const CourseCard = ({ id, title, description, difficulty, estimatedHours, progress = 0 }: CourseCardProps) => {
  return (
    <Card className="hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-card border-2 hover:border-primary/30">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-xl flex-1">{title}</CardTitle>
          <Badge className={difficultyColors[difficulty as keyof typeof difficultyColors]}>
            {difficulty}
          </Badge>
        </div>
        <CardDescription className="text-base line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{estimatedHours}h</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{progress}% complete</span>
          </div>
        </div>
        {progress > 0 && (
          <div className="mt-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-success transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link to={`/course/${id}`}>
            {progress > 0 ? "Continue Learning" : "Start Course"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
