import { ShieldCheck, Timer, Wallet, Award, Truck, Star } from "lucide-react";
import { FollowerPointerCard } from "@/components/ui/following-pointer";
import ScrollStack, { ScrollStackItem } from "@/component/ScrollStack";
import { useEffect, useState } from "react";

export const Features = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const items = [
    { 
      icon: ShieldCheck, 
      title: "Premium Quality", 
      desc: "Fresh & trusted products with quality guarantee",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
  
    { 
      icon: Wallet, 
      title: "Best Prices", 
      desc: "Competitive pricing with daily deals",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    
    { 
      icon: Truck, 
      title: "Free Delivery", 
      desc: "No delivery charges on orders above Rs.299",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    
  ];

  return (
    <section className="py-16 lg:py-20 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-secondary/2 to-accent/3"></div>
      <div className="absolute inset-0 bg-pattern opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Why Choose <span className="text-blue-900">MDMart</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of grocery shopping with our premium service, 
            lightning-fast delivery, and commitment to quality.
          </p>
        </div>

        {/* Features - ScrollStack on Mobile, Grid on Desktop */}
        {isMobile ? (
          <div className="max-w-4xl mx-auto">
            <ScrollStack
              useWindowScroll={true}
              itemDistance={150}
              itemStackDistance={40}
              stackPosition="30%"
              baseScale={0.9}
              itemScale={0.05}
              rotationAmount={2}
              blurAmount={2}
            >
              {items.map(({ icon: Icon, title, desc, color }, i) => (
                <ScrollStackItem
                  key={title}
                  itemClassName="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/80 backdrop-blur-sm text-center hover:shadow-2xl transition-all duration-500 hover:border-primary/20"
                >
                  <div className="h-full p-8">
                    {/* Background Color */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                    
                    {/* Icon Container */}
                    <div className={`relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className={`h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300`} />
                      
                      {/* Icon Glow Effect */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300`}></div>
                    </div>
                    
                    {/* Content */}
                    <h3 className={`text-xl font-bold text-foreground mb-3 group-hover:bg-gradient-to-r ${color} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                      {title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {desc}
                    </p>
                    
                    {/* Hover Effect Line */}
                    <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${color} group-hover:w-full transition-all duration-500`}></div>
                  </div>
                </ScrollStackItem>
              ))}
            </ScrollStack>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map(({ icon: Icon, title, desc, color }, i) => (
              <FollowerPointerCard
                key={title}
                title={
                  <div className="flex items-center space-x-2">
                    <Icon className="h-3 w-3" />
                    <p className="text-xs font-semibold">{title}</p>
                  </div>
                }
                className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 hover:border-primary/20"
              >
                {/* Background Color */}
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Icon Container */}
                <div className={`relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className={`h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300`} />
                  
                  {/* Icon Glow Effect */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300`}></div>
                </div>
                
                {/* Content */}
                <h3 className={`text-xl font-bold text-foreground mb-3 group-hover:bg-gradient-to-r ${color} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                  {title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {desc}
                </p>
                
                {/* Hover Effect Line */}
                <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${color} group-hover:w-full transition-all duration-500`}></div>
              </FollowerPointerCard>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-100 border border-orange-300 text-orange-700 font-semibold">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span>Join 1M+ happy customers</span>
          </div>
        </div>
      </div>
    </section>
  );
};


