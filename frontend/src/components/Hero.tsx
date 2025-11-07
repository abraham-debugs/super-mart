import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Shield, ShoppingBag, Truck } from "lucide-react";

const heroGraphic = "/online-shopping-vector-illustration1-removebg-preview.png";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9f5ff] via-white to-[#f2f7ff]" />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-[40%] bg-[#ffe3d8] opacity-70 blur-2xl" />
      <div className="absolute top-10 right-[-10%] h-80 w-80 rounded-[45%] bg-[#dfe9ff] opacity-70 blur-2xl" />
      <div className="absolute bottom-[-15%] left-[45%] h-60 w-60 rounded-full bg-[#fef0d8] opacity-70 blur-2xl" />

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-16 lg:gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#ffe8d0] px-5 py-2 text-sm font-semibold text-[#f45d48] shadow-sm">
                  <ShoppingBag className="h-4 w-4" />
                  Smart Grocery Delivery
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-[#1c2a52]">
                  Online Shopping
                  <br className="hidden sm:block" />
                  Made Effortless
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-[#4c5b8a] max-w-xl">
                  Shop the latest essentials, track deliveries, and enjoy rewards across every order—all from the comfort of your home.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="rounded-full bg-[#f45d48] px-8 py-6 text-base sm:text-lg font-semibold shadow-lg shadow-[#f45d4833] transition-transform duration-200 hover:-translate-y-1 hover:bg-[#d94b39]"
                >
                  Try Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-2 border-[#d8e0ff] px-8 py-6 text-base sm:text-lg font-semibold text-[#1c4bff] transition-colors duration-200 hover:bg-white hover:text-[#153fe0]"
                >
                  <Clock className="mr-2 h-5 w-5" />
                  Learn More
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3 text-sm sm:text-base text-[#4c5b8a]">
                  <Truck className="h-5 w-5 text-[#f45d48]" />
                  Superfast doorstep delivery
                </div>
                <div className="flex items-center gap-3 text-sm sm:text-base text-[#4c5b8a]">
                  <Shield className="h-5 w-5 text-[#f45d48]" />
                  Secure payments & rewards
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-12 right-4 h-60 w-60 rounded-[45%] bg-[#ffd1e3] opacity-60 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-48 w-48 rounded-[50%] bg-[#cde5ff] opacity-60 blur-3xl" />
              <div className="relative flex items-center justify-center rounded-[2.5rem] bg-white/90 p-6 shadow-xl">
                <img
                  src={heroGraphic}
                  alt="People shopping online"
                  className="w-full max-w-[520px] md:max-w-[560px] h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};