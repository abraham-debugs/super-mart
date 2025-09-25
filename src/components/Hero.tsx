import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Clock } from "lucide-react";
import heroImage from "@/assets/zepto-hero.jpg";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Clock className="h-4 w-4" />
              Delivery in 10 Minutes
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Groceries in
                <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  10 Minutes
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground max-w-lg">
                Get your daily essentials delivered super fast. Fresh groceries, dairy, snacks & household items at your doorstep in just 10 minutes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-primary">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Order Now
              </Button>
              
              <Button variant="outline" size="lg" className="group">
                Browse Groceries
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-foreground">5000+</div>
                <div className="text-sm text-muted-foreground">Groceries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-foreground">10 Min</div>
                <div className="text-sm text-muted-foreground">Delivery</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-foreground">100%</div>
                <div className="text-sm text-muted-foreground">Fresh</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={heroImage}
                alt="Quick grocery delivery in 10 minutes"
                className="w-full h-auto rounded-2xl shadow-card-hover"
              />
            </div>
            
            {/* Background Elements */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full gradient-primary opacity-20 rounded-3xl blur-3xl -z-10"></div>
            
            {/* Floating Cards */}
            <div className="absolute -top-4 -right-4 bg-card border border-border rounded-2xl p-4 shadow-card hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm font-medium">10 Min Delivery</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-2xl p-4 shadow-card hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">Fresh Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};