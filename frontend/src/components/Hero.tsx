import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FollowerPointerCard } from "@/components/ui/following-pointer";
import { ArrowRight, Clock, Shield, ShoppingBag, Truck } from "lucide-react";

const heroGraphic = "/online-shopping-vector-illustration1-removebg-preview.png";

export const Hero = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let raf = 0;

    const handleScroll = () => {
      const current = window.scrollY;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(current));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (event.clientX / innerWidth - 0.5) * 120;
      const y = (event.clientY / innerHeight - 0.5) * 120;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const layerSlow = {
    transform: `translate3d(${mousePos.x * 0.04}px, ${scrollY * 0.08}px, 0)`,
  };
  const layerMedium = {
    transform: `translate3d(${mousePos.x * 0.06}px, ${scrollY * 0.12}px, 0)`,
  };
  const layerFast = {
    transform: `translate3d(${mousePos.x * 0.08}px, ${scrollY * 0.18}px, 0)`,
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9f5ff] via-white to-[#f2f7ff]" />
      <div
        className="absolute -top-24 -left-24 h-72 w-72 rounded-[40%] bg-[#ffe3d8] opacity-70 blur-2xl transition-transform duration-[1000ms] ease-out will-change-transform"
        style={layerSlow}
      />
      <div
        className="absolute top-10 right-[-10%] h-80 w-80 rounded-[45%] bg-[#dfe9ff] opacity-70 blur-2xl transition-transform duration-[1000ms] ease-out will-change-transform"
        style={layerMedium}
      />
      <div
        className="absolute bottom-[-15%] left-[45%] h-60 w-60 rounded-full bg-[#fef0d8] opacity-70 blur-2xl transition-transform duration-[1000ms] ease-out will-change-transform"
        style={layerFast}
      />
      <div
        className="absolute left-[10%] top-[-160px] h-44 w-44 rounded-full bg-[#ffd6ff] opacity-60 blur-3xl transition-transform duration-[1000ms] ease-out will-change-transform"
        style={layerMedium}
      />
      <div
        className="absolute right-[15%] bottom-[-190px] h-56 w-56 rounded-[45%] bg-[#d0f5ff] opacity-60 blur-3xl transition-transform duration-[1000ms] ease-out will-change-transform"
        style={layerSlow}
      />

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
            <div
              className="space-y-10 transition-transform duration-[1000ms] ease-out will-change-transform"
              style={{
                transform: `translate3d(${mousePos.x * -0.05}px, ${scrollY * -0.05}px, 0)`,
              }}
            >
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ffe8d0] px-5 py-2 text-sm font-semibold text-[#f45d48] shadow-sm">
                  <ShoppingBag className="h-4 w-4" />
                  Smart Grocery Delivery
                </span>

                <h1 className="text-4xl font-bold leading-[1.05] text-[#1c2a52] sm:text-5xl lg:text-6xl">
                  Online Shopping
                  <br className="hidden sm:block" />
                  Made Effortless
                </h1>

                <p className="max-w-xl text-base text-[#4c5b8a] sm:text-lg lg:text-xl">
                  Shop the latest essentials, track deliveries, and enjoy rewards across every order—all from the comfort of your home.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <FollowerPointerCard
                  title={
                    <div className="flex items-center space-x-2">
                      <ShoppingBag className="h-3 w-3" />
                      <p className="text-xs font-semibold">Start Shopping</p>
                    </div>
                  }
                >
                  <Button
                    size="lg"
                    className="rounded-full bg-[#f45d48] px-8 py-6 text-base font-semibold shadow-lg shadow-[#f45d4833] transition-transform duration-200 hover:-translate-y-1 hover:bg-[#d94b39] sm:text-lg"
                  >
                    Try Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </FollowerPointerCard>
                <FollowerPointerCard
                  title={
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <p className="text-xs font-semibold">Learn More</p>
                    </div>
                  }
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full border-2 border-[#d8e0ff] px-8 py-6 text-base font-semibold text-[#1c4bff] transition-colors duration-200 hover:bg-white hover:text-[#153fe0] sm:text-lg"
                  >
                    <Clock className="mr-2 h-5 w-5" />
                    Learn More
                  </Button>
                </FollowerPointerCard>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3 text-sm text-[#4c5b8a] sm:text-base">
                  <Truck className="h-5 w-5 text-[#f45d48]" />
                  Superfast doorstep delivery
                </div>
                <div className="flex items-center gap-3 text-sm text-[#4c5b8a] sm:text-base">
                  <Shield className="h-5 w-5 text-[#f45d48]" />
                  Secure payments & rewards
                </div>
              </div>
            </div>

            <div
              className="relative transition-transform duration-[1000ms] ease-out will-change-transform"
              style={{
                transform: `translate3d(${mousePos.x * 0.08}px, ${scrollY * 0.06}px, 0)`,
              }}
            >
              <div
                className="absolute -top-12 right-4 h-60 w-60 rounded-[45%] bg-[#ffd1e3] opacity-60 blur-3xl transition-transform duration-[1000ms] ease-out will-change-transform"
                style={layerMedium}
              />
              <div
                className="absolute bottom-0 left-0 h-48 w-48 rounded-[50%] bg-[#cde5ff] opacity-60 blur-3xl transition-transform duration-[1000ms] ease-out will-change-transform"
                style={layerFast}
              />
              <div
                className="relative flex items-center justify-center rounded-[2.5rem] bg-white/90 p-6 shadow-xl transition-transform duration-[1000ms] ease-out will-change-transform backdrop-blur-sm"
                style={{
                  transform: `translate3d(${mousePos.x * 0.12}px, ${scrollY * -0.04}px, 0)`,
                }}
              >
                <img
                  src={heroGraphic}
                  alt="People shopping online"
                  className="h-auto w-full max-w-[520px] md:max-w-[560px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};