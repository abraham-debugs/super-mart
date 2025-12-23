import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();
  const slides = [
    {
      id: 1,
      subtitle: "Fresh & Healthy",
      title: "Organic Fruits & Vegetables",
      description: "Get up to 30% off on your first order of fresh farm produce.",
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2670&auto=format&fit=crop",
      color: "text-green-600",
      bgFrom: "from-green-50",
      bgTo: "to-green-100"
    },
    {
      id: 2,
      subtitle: "Daily Essentials",
      title: "Grocery Delivered in Minutes",
      description: "Fastest delivery for all your daily needs. Order now!",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop",
      color: "text-orange-600",
      bgFrom: "from-orange-50",
      bgTo: "to-orange-100"
    },
    {
      id: 3,
      subtitle: "Fresh Bakery",
      title: "Baked with Love, Served Fresh",
      description: "Delicious bakery items starting at just Rs. 49.",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2672&auto=format&fit=crop",
      color: "text-amber-600",
      bgFrom: "from-amber-50",
      bgTo: "to-amber-100"
    }
  ];

  return (
    <section className="relative w-full -my-14 -py-8 overflow-hidden bg-white">
      <Carousel
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className={`relative min-h-[500px] lg:min-h-[600px] -py-8 w-full bg-gradient-to-r ${slide.bgFrom} via-white ${slide.bgTo}`}>
                <div className="container mx-auto h-full px-4 lg:px-8">
                  <div className="flex flex-col lg:flex-row h-full items-center justify-between py-12 lg:py-0 gap-8">

                    {/* Text Content */}
                    <div className="flex-1 space-y-6 text-center lg:text-left z-10 pt-10">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider bg-white shadow-sm ${slide.color} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
                        {slide.subtitle}
                      </span>
                      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                        {slide.title}
                      </h1>
                      <p className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
                        {slide.description}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
                        <Button size="lg" className="rounded-full px-8 py-6 text-lg font-bold bg-primary hover:bg-primary-dark shadow-lg shadow-primary/25" onClick={() => navigate('/shop?category=Fresh%20Produce')}>
                          Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg font-bold border-2">
                          View Deals
                        </Button>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="flex-1 relative flex items-center justify-center lg:h-[600px] w-full">
                      <div className="relative z-10 w-full max-w-[500px] lg:max-w-none aspect-square lg:aspect-auto h-auto lg:h-[80%] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-1000">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Defensive decorative elem */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl -z-10" />
                    </div>

                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Buttons - Hidden on mobile, styled for desktop */}
        <div className="hidden lg:block">
          <CarouselPrevious className="left-4 h-12 w-12 border-2 border-gray-200 hover:bg-primary hover:text-white hover:border-primary" />
          <CarouselNext className="right-4 h-12 w-12 border-2 border-gray-200 hover:bg-primary hover:text-white hover:border-primary" />
        </div>
      </Carousel>

      {/* Features Banner (Bottom) */}
      <div className="w-full bg-white border-b border-gray-100 py-8">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "🚚", title: "Free Shipping", desc: "On all orders of $200" },
            { icon: "🎧", title: "24/7 Support", desc: "Get help when you need it" },
            { icon: "💸", title: "100% Money Back", desc: "If you don't like it" },
            { icon: "🥬", title: "Fresh Produce", desc: "Directly from the farm" },
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 rounded-xl hover:shadow-lg transition-shadow bg-gray-50/50 hover:bg-white cursor-default">
              <span className="text-4xl">{feature.icon}</span>
              <div>
                <h3 className="font-bold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};