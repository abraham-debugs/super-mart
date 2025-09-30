import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Clock } from "lucide-react";
import heroImage from "@/assets/zepto-hero.jpg";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden gradient-hero bg-pattern">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary text-sm font-medium border border-primary/20 shadow-soft bounce-in">
              <Clock className="h-4 w-4 animate-pulse" />
              Delivery in 10 Minutes
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight slide-up">
                Groceries in
                <span className="block text-gradient pulse-glow">
                  10 Minutes
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground max-w-lg leading-relaxed fade-in">
                Get your daily essentials delivered super fast. Fresh groceries, dairy, snacks & household items at your doorstep in just 10 minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-primary hover:shadow-primary/50 transition-all duration-300 hover:scale-105 active:scale-95 bounce-in">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Order Now
              </Button>
              
              <Button variant="outline" size="lg" className="group border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 hover:scale-105 active:scale-95 slide-up">
                Browse Groceries
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:scale-105 transition-transform duration-300 scale-in">
                <div className="text-2xl lg:text-3xl font-bold text-gradient">5000+</div>
                <div className="text-sm text-muted-foreground">Groceries</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:scale-105 transition-transform duration-300 scale-in" style={{animationDelay: '0.2s'}}>
                <div className="text-2xl lg:text-3xl font-bold text-gradient">10 Min</div>
                <div className="text-sm text-muted-foreground">Delivery</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:scale-105 transition-transform duration-300 scale-in" style={{animationDelay: '0.4s'}}>
                <div className="text-2xl lg:text-3xl font-bold text-gradient">100%</div>
                <div className="text-sm text-muted-foreground">Fresh</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10 scale-in">
              <img
                src={heroImage}
                alt="Quick grocery delivery in 10 minutes"
                className="w-full h-auto rounded-2xl shadow-card-hover border border-border/20 hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            {/* Background Elements */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full gradient-primary opacity-15 rounded-3xl blur-3xl -z-10 pulse-glow"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full gradient-secondary opacity-10 rounded-3xl blur-3xl -z-10 pulse-glow" style={{animationDelay: '1s'}}></div>
            
            {/* Floating Cards */}
            <div className="absolute -top-4 -right-4 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-card hidden lg:block floating-animation bounce-in">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">10 Min Delivery</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-card hidden lg:block floating-animation bounce-in" style={{animationDelay: '2s'}}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Fresh Quality</span>
              </div>
            </div>
            
            {/* Additional floating element */}
            <div className="absolute top-1/4 -left-8 bg-accent/80 backdrop-blur-sm border border-accent/50 rounded-xl p-3 shadow-card hidden lg:block floating-animation bounce-in" style={{animationDelay: '4s'}}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Premium Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};