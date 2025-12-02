import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import heroCart from "@/assets/hero-cart.png";
import heroImage from "@/assets/hero-image.jpg";
import smartwatch from "@/assets/smartwatch.jpg";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

interface PosterSlide {
  _id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl: string;
  order?: number;
}

const FALLBACK_SLIDES: PosterSlide[] = [
  {
    _id: "fallback-1",
    title: "Mega Fresh Grocery Fiesta",
    subtitle: "Limited Time",
    description: "Save up to 40% on fruits, veggies, and everyday essentials. Offer valid till Sunday!",
    ctaText: "Shop Groceries",
    ctaLink: "/#shop",
    imageUrl: heroCart,
    order: 0,
  },
  {
    _id: "fallback-2",
    title: "Gadgets Festival Week",
    subtitle: "Hot Deals",
    description: "Pick the latest smart devices with exclusive launch prices and free delivery.",
    ctaText: "Grab Tech",
    ctaLink: "/#shop",
    imageUrl: smartwatch,
    order: 1,
  },
  {
    _id: "fallback-3",
    title: "Home & Kitchen Super Savers",
    subtitle: "Trending Now",
    description: "Upgrade your kitchen with combos and cashback on cookware & storage picks.",
    ctaText: "Explore Offers",
    ctaLink: "/#shop",
    imageUrl: heroImage,
    order: 2,
  },
];

const GRADIENTS = [
  "from-[#fff2d8] via-[#ffe8ef] to-[#e2f3ff]",
  "from-[#e0f1ff] via-[#f4f8ff] to-[#fbe9ff]",
  "from-[#fff7e0] via-[#fff0f2] to-[#e9f4ff]",
  "from-[#f3f9ff] via-[#fff4f4] to-[#fffaf0]",
];

const AUTOPLAY_DELAY = 5500;

export const AdsCarousel = () => {
  const [slides, setSlides] = useState<PosterSlide[]>(FALLBACK_SLIDES);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadPosters() {
      try {
        const res = await fetch(`${API_BASE}/api/ads`);
        if (!res.ok) throw new Error("Failed to fetch posters");
        const data = await res.json();
        if (!ignore && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((poster: any, idx: number) => ({
            _id: poster._id,
            title: poster.title || "Untitled Poster",
            subtitle: poster.subtitle || "",
            description: poster.description || "",
            ctaText: poster.ctaText || "Shop Now",
            ctaLink: poster.ctaLink || "/",
            imageUrl: poster.imageUrl,
            order:
              typeof poster.order === "number"
                ? poster.order
                : Number.isFinite(Number(poster.order))
                ? Number(poster.order)
                : idx,
          }));

          mapped.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setSlides(mapped);
          setActiveIndex(0);
        }
      } catch (err) {
        console.warn("AdsCarousel: using fallback posters", err);
      }
    }

    loadPosters();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!slides.length) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_DELAY);

    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [slides.length, activeIndex]);

  const orderedSlides = useMemo(() => {
    if (!slides.length) return FALLBACK_SLIDES;
    return slides;
  }, [slides]);

  const handleCtaClick = (link?: string) => {
    if (!link) return;
    if (link.startsWith("http")) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = link;
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {orderedSlides.map((slide, index) => {
            const gradientClass = GRADIENTS[index % GRADIENTS.length];
            return (
              <div
                key={slide._id || `slide-${index}`}
                className="flex w-full flex-col items-start justify-between gap-10 p-8 md:flex-row md:items-center md:gap-12 lg:p-12"
              >
                <div className="flex-1 space-y-4">
                  {slide.subtitle && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                      {slide.subtitle}
                    </span>
                  )}
                  <h3 className="text-3xl font-bold text-[#1c2a52] md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                    {slide.title}
                  </h3>
                  {slide.description && (
                    <p className="max-w-xl text-base text-[#445075] md:text-lg">
                      {slide.description}
                    </p>
                  )}
                  {slide.ctaText && (
                    <Button
                      className="rounded-full bg-[#f7aa29] px-6 py-5 text-sm font-semibold uppercase tracking-wide text-[#1c2a52] shadow-[0_15px_30px_rgba(247,170,41,0.35)] transition-colors duration-200 hover:bg-[#e49a21]"
                      onClick={() => handleCtaClick(slide.ctaLink)}
                    >
                      {slide.ctaText}
                    </Button>
                  )}
                </div>

                <div className="relative flex flex-1 items-center justify-center">
                  <div className={`absolute inset-4 rounded-[2.5rem] bg-gradient-to-br ${gradientClass} blur-2xl opacity-70`} />
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="relative z-10 h-full max-h-[320px] w-full max-w-[420px] object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {orderedSlides.map((slide, index) => (
            <button
              key={slide._id || `indicator-${index}`}
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



