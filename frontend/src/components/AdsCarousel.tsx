import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import heroCart from "@/assets/hero-cart.png";
import heroImage from "@/assets/hero-image.jpg";
import smartwatch from "@/assets/smartwatch.jpg";

interface AdSlide {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  image: string;
  tint: string;
}

const ADS: AdSlide[] = [
  {
    id: "fresh-groceries",
    eyebrow: "Limited Time",
    title: "Mega Fresh Grocery Fiesta",
    description: "Save up to 40% on fruits, veggies, and everyday essentials. Offer valid till Sunday!",
    cta: "Shop Groceries",
    image: heroCart,
    tint: "from-[#fff2d8] via-white to-[#ffe6f0]",
  },
  {
    id: "tech-deals",
    eyebrow: "Hot Deals",
    title: "Gadgets Festival Week",
    description: "Pick the latest smart devices with exclusive launch prices and free delivery.",
    cta: "Grab Tech",
    image: smartwatch,
    tint: "from-[#e0f1ff] via-white to-[#f4eaff]",
  },
  {
    id: "home-essentials",
    eyebrow: "Trending Now",
    title: "Home & Kitchen Super Savers",
    description: "Upgrade your kitchen with combos and cashback on atlas cookware & storage picks.",
    cta: "Explore Offers",
    image: heroImage,
    tint: "from-[#fff7e0] via-white to-[#e8f4ff]",
  },
];

const AUTOPLAY_DELAY = 5500;

export const AdsCarousel = () => {
  const slides = useMemo(() => ADS, []);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_DELAY);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="container mx-auto px-4">
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex w-full flex-col items-start justify-between gap-10 p-8 md:flex-row md:items-center md:gap-12 lg:p-12"
            >
              <div className="flex-1 space-y-4">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                  {slide.eyebrow}
                </span>
                <h3 className="text-3xl font-bold text-[#1c2a52] md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                  {slide.title}
                </h3>
                <p className="max-w-xl text-base text-[#445075] md:text-lg">
                  {slide.description}
                </p>
                <Button className="rounded-full bg-[#f7aa29] px-6 py-5 text-sm font-semibold uppercase tracking-wide text-[#1c2a52] shadow-[0_15px_30px_rgba(247,170,41,0.35)] transition-colors duration-200 hover:bg-[#e49a21]">
                  {slide.cta}
                </Button>
              </div>

              <div className="relative flex flex-1 items-center justify-center">
                <div className={`absolute inset-4 rounded-[2.5rem] bg-gradient-to-br ${slide.tint} blur-2xl opacity-70`} />
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="relative z-10 h-full max-h-[320px] w-full max-w-[420px] object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-8 bg-[#f7aa29]"
                  : "w-2.5 bg-[#f7aa29]/40 hover:bg-[#f7aa29]/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdsCarousel;

