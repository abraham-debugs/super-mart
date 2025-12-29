import React from "react";
import {
  Heart,
  Target,
  Users,
  Award,
  ShoppingBag,
  Truck,
  Shield,
  Sparkles,
  TrendingUp,
  Globe,
  CheckCircle,
  Star
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutUs: React.FC = () => {
  const stats = [
    { icon: Users, value: "50K+", label: "Happy Customers" },
    { icon: ShoppingBag, value: "10K+", label: "Premium Products" },
    { icon: Truck, value: "100+", label: "Districts Served" },
    { icon: Award, value: "5+", label: "Years of Excellence" },
  ];

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "Your satisfaction is the heartbeat of our operation. We go above and beyond everyday.",
      color: "text-rose-500",
      bg: "bg-rose-50"
    },
    {
      icon: Shield,
      title: "Trust & Integrity",
      description: "Absolute transparency in every transaction, protected by top-tier security standards.",
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      icon: Sparkles,
      title: "Quality Assured",
      description: "We handpick every item to ensure only the premium grade reaches your doorstep.",
      color: "text-amber-500",
      bg: "bg-amber-50"
    },
    {
      icon: TrendingUp,
      title: "Continuous Innovation",
      description: "Pioneering the future of retail with smart technology and intuitive shopping experiences.",
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Parallax-like effect */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/C:/Users/HARIHARAN K/.gemini/antigravity/brain/9a80f5f9-fd14-4db6-9909-9cd09461534d/about_us_hero_banner_1766292714775.png"
            alt="About Super Mart"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
        </div>

        <div className="container mx-auto px-4 z-10 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-white uppercase bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            Our Story
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            Redefining the <span className="text-primary italic">Future</span> <br className="hidden md:block" /> of Quality Retail.
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-light">
            Founded with a passion for excellence, MD Mart is more than just a store—we are your dedicated partner in everyday living.
          </p>
        </div>
      </section>

      {/* Modern Stats Layer */}
      <section className="relative -mt-20 z-20 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <stat.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-4xl font-extrabold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-500 font-medium uppercase tracking-widest text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision - More Minimalist */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16 max-w-6xl mx-auto">
            <div className="lg:w-1/2 space-y-12">
              <div className="space-y-4">
                <h2 className="text-primary font-bold tracking-[0.2em] uppercase text-sm">Our Purpose</h2>
                <h3 className="text-4xl font-bold text-gray-900 leading-tight">Empowering lives through seamless innovation.</h3>
              </div>

              <div className="grid gap-10">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Our Mission</h4>
                    <p className="text-gray-600 leading-relaxed font-light text-lg">
                      To craft the most intuitive and rewarding shopping journey for everyone, anywhere. We believe quality should be accessible without compromise.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Our Vision</h4>
                    <p className="text-gray-600 leading-relaxed font-light text-lg">
                      To be the global benchmark for customer-centric retail, where technology and human touch meet perfectly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="aspect-square rounded-[40px] overflow-hidden shadow-2xl skew-y-2 lg:skew-y-0 lg:-rotate-2 hover:rotate-0 transition-transform duration-700">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1074"
                  alt="Quality Products"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 hidden md:block animate-bounce-slow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Star className="h-6 w-6 fill-current" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">4.9/5 Rating</p>
                    <p className="text-xs text-gray-400">Trusted by thousands</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values - Grid with Premium Cards */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4">Integrity in Action</h2>
            <h3 className="text-4xl font-bold text-gray-900">The Values That Drive Us</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="group relative p-10 bg-white border border-gray-100 rounded-[40px] hover:border-primary/20 transition-all duration-500 overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 ${value.bg} rounded-bl-[100px] -mr-4 -mt-4 transition-all duration-500 group-hover:w-full group-hover:h-full group-hover:rounded-none group-hover:mr-0 group-hover:mt-0 opacity-20`}></div>

                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl ${value.bg} flex items-center justify-center mb-8 ${value.color}`}>
                    <value.icon className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h4>
                  <p className="text-gray-500 leading-relaxed font-light">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Sophisticated Overlay */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="relative rounded-[60px] overflow-hidden bg-gray-900 px-8 py-24 text-center">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[120px] rounded-full translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-full bg-blue-500/10 blur-[100px] rounded-full -translate-x-1/2"></div>

            <div className="relative z-10 max-w-3xl mx-auto space-y-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                Experience the <span className="text-primary italic">Excellence</span> <br /> You Deserve.
              </h2>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/shop">
                  <Button
                    size="lg"
                    className="h-16 px-10 rounded-full font-bold text-lg bg-primary hover:bg-primary/90 hover:scale-105 transition-all shadow-xl shadow-primary/20"
                  >
                    Start Your Shopping Journey
                  </Button>
                </Link>
                <Link to="/subscription-plans">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-16 px-10 rounded-full font-bold text-lg bg-grey-300 text-white hover:bg-white/10 transition-all"
                  >
                    Explore Membership
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;



