import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Clock } from "lucide-react";
import heroImage from "@/assets/zepto-hero.jpg";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden font-display">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left copy */}
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-semibold leading-tight text-foreground font-display">
              Fill your cart with
              <br /> fresh groceries —
              <br /> delivered fast
              <br /> with <span className="text-secondary">convenience</span> and
              <br /> <span className="text-secondary">value</span>
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground max-w-xl">
              India&apos;s first premium seaweed-coated food boxes
            </p>
            <Button variant="outline" size="lg" className="rounded-full px-6 py-5 border-border hover:bg-secondary/10">
              Explore Collection
            </Button>
          </div>

          {/* Right image */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-card bg-card border border-border">
              <img src={heroImage} alt="Premium packaging" className="w-full h-auto object-cover" />
            </div>
            <div className="absolute -inset-4 rounded-[2rem] bg-black/5 blur-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};