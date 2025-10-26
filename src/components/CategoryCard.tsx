import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Shield, Languages, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  courseCount: number;
}

const iconMap = {
  Code: Code,
  Shield: Shield,
  Languages: Languages,
};

export const CategoryCard = ({ id, name, description, icon, color, courseCount }: CategoryCardProps) => {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Code;

  return (
    <Card className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-2 hover:border-primary/50">
      <CardHeader>
        <div className="p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: color }}>
          <IconComponent className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {courseCount} {courseCount === 1 ? "course" : "courses"}
          </span>
          <Button asChild variant="ghost" className="group/btn">
            <Link to={`/category/${id}`}>
              Explore
              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
