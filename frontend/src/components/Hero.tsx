import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Clock, Star, Truck, Shield } from "lucide-react";
import heroImage from "@/assets/zepto-hero.jpg";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/3 to-accent/5"></div>
      <div className="absolute inset-0 bg-pattern opacity-20"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent/10 rounded-full blur-lg animate-pulse delay-500"></div>
      
      <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Star className="w-4 h-4 fill-current" />
                <span>Trusted by 1M+ customers</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] text-foreground">
                Fresh groceries
                <br />
                <span className="text-blue-600">
                  delivered fast
                </span>
                <br />
                to your door
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Experience the convenience of premium grocery delivery with our 
                <span className="text-primary font-semibold"> seaweed-coated packaging</span> 
                that keeps your food fresh and sustainable.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="rounded-full px-8 py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Start Shopping
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full px-8 py-6 text-lg font-semibold border-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
              >
                <Clock className="mr-2 w-5 h-5" />
                Track Order
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="w-4 h-4 text-primary" />
                <span>Free delivery on orders over Rs.299</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" />
                <span>100% secure payments</span>
              </div>
            </div>
          </div>

          {/* Right image with enhanced styling */}
          <div className="relative">
            <div className="relative">
              {/* Main image container */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-card border border-border/50">
                <img 
                  src={heroImage} 
                  alt="Premium grocery delivery" 
                  className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105" 
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>
              
              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-lg border border-border/50 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Fast Delivery</p>
                    <p className="text-xs text-muted-foreground">15-30 mins</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-lg border border-border/50 animate-float" style={{animationDelay: '1s'}}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-blue-600 fill-current" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">4.8 Rating</p>
                    <p className="text-xs text-muted-foreground">Based on 10k+ reviews</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background blur elements */}
            <div className="absolute -inset-8 rounded-[3rem] bg-blue-100 blur-3xl -z-10"></div>
            <div className="absolute -inset-4 rounded-[2.5rem] bg-blue-50 blur-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};