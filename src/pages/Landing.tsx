import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { GraduationCap, Zap, Trophy, TrendingUp } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-block mb-6 animate-bounce-soft">
            <div className="p-4 bg-gradient-hero rounded-2xl">
              <GraduationCap className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent animate-fade-in">
            Learn By Doing
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-slide-up">
            Master new skills through hands-on projects and real-world practice.
            From web development to cybersecurity to languages—learn by building.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in">
            <Button asChild size="lg" className="bg-gradient-hero hover:opacity-90 text-lg px-8 shadow-strong">
              <Link to="/auth">Start Learning Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Learn By Doing?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-xl hover:bg-card transition-colors">
              <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Hands-On Projects</h3>
              <p className="text-muted-foreground">
                Learn by building real projects, not just watching videos or reading theory.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl hover:bg-card transition-colors">
              <div className="inline-block p-3 bg-secondary/10 rounded-full mb-4">
                <Trophy className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Track Progress</h3>
              <p className="text-muted-foreground">
                See your achievements and completed courses with visual progress tracking.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl hover:bg-card transition-colors">
              <div className="inline-block p-3 bg-success/10 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Skill Development</h3>
              <p className="text-muted-foreground">
                From coding to security to languages—build practical skills that matter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners building real skills through hands-on practice.
          </p>
          <Button asChild size="lg" className="bg-gradient-hero hover:opacity-90 text-lg px-8 shadow-strong">
            <Link to="/auth">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
