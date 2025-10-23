import { ShieldCheck, Timer, Wallet, Award, Truck, Star } from "lucide-react";

export const Features = () => {
  const items = [
    { 
      icon: ShieldCheck, 
      title: "Premium Quality", 
      desc: "Fresh & trusted products with quality guarantee",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
  
    { 
      icon: Wallet, 
      title: "Best Prices", 
      desc: "Competitive pricing with daily deals",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    
    { 
      icon: Truck, 
      title: "Free Delivery", 
      desc: "No delivery charges on orders above ₹299",
      color: "from-indigo-500 to-blue-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600"
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
            Why Choose <span className="text-blue-600">Zepto</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of grocery shopping with our premium service, 
            lightning-fast delivery, and commitment to quality.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, desc, color, bgColor, iconColor }, i) => (
            <div 
              key={title} 
              className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 hover:border-primary/20"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Background Color */}
              <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              
              {/* Icon Container */}
              <div className={`relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`h-8 w-8 ${iconColor} group-hover:scale-110 transition-transform duration-300`} />
                
                {/* Icon Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-blue-200 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                {title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {desc}
              </p>
              
              {/* Hover Effect Line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-blue-600 group-hover:w-full transition-all duration-500"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-semibold">
            <Star className="w-5 h-5 fill-current" />
            <span>Join 1M+ happy customers</span>
          </div>
        </div>
      </div>
    </section>
  );
};


