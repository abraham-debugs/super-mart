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
    { icon: ShoppingBag, value: "10K+", label: "Products" },
    { icon: Truck, value: "100+", label: "Cities Served" },
    { icon: Award, value: "5+", label: "Years Experience" },
  ];

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "Your satisfaction is our top priority. We go above and beyond to ensure you have the best shopping experience.",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Your data and transactions are protected with industry-leading security measures and encryption.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Sparkles,
      title: "Quality Products",
      description: "We carefully curate our product selection to bring you only the best quality items at competitive prices.",
      color: "from-orange-500 to-yellow-500"
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "We continuously improve our platform with the latest technology to make shopping easier and more enjoyable.",
      color: "from-purple-500 to-pink-500"
    },
  ];

  const milestones = [
    { year: "2019", title: "Founded", description: "Started with a vision to revolutionize online shopping" },
    { year: "2020", title: "10K Customers", description: "Reached our first major milestone" },
    { year: "2021", title: "National Expansion", description: "Expanded services across the country" },
    { year: "2022", title: "Mobile App Launch", description: "Launched our mobile application" },
    { year: "2023", title: "50K Customers", description: "Celebrated 50,000 happy customers" },
    { year: "2024", title: "AI Integration", description: "Introduced AI-powered recommendations" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 via-red-500 to-blue-500 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About Super Mart Shop
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Your trusted partner for quality products and exceptional service
            </p>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              We're more than just an online store. We're a community dedicated to bringing you the best shopping experience with quality products, fast delivery, and outstanding customer service.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${index % 4 === 0 ? 'from-orange-500 to-red-500' : index % 4 === 1 ? 'from-red-500 to-pink-500' : index % 4 === 2 ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500'} mb-4`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  To provide our customers with a seamless shopping experience by offering high-quality products, 
                  competitive prices, and exceptional customer service. We strive to make online shopping convenient, 
                  reliable, and enjoyable for everyone.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  To become the leading online marketplace that connects customers with quality products while 
                  maintaining the highest standards of service, innovation, and customer satisfaction. We envision 
                  a future where shopping is effortless and delightful.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These values guide everything we do and shape how we serve our customers
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-4`}>
                    <value.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Milestones that have shaped our growth and success
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-red-500 to-blue-500"></div>
              
              {/* Timeline items */}
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative flex items-start gap-6">
                    <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${
                      index % 3 === 0 ? 'from-orange-500 to-red-500' : 
                      index % 3 === 1 ? 'from-red-500 to-pink-500' : 
                      'from-blue-500 to-cyan-500'
                    } flex items-center justify-center shadow-lg`}>
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <Card className="flex-1 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-2xl font-bold text-orange-600">{milestone.year}</span>
                          <h3 className="text-xl font-bold text-gray-900">{milestone.title}</h3>
                        </div>
                        <p className="text-gray-600">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gradient-to-br from-orange-50 via-red-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover what makes us different and why thousands of customers trust us
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Star,
                title: "Premium Quality",
                description: "We source products from trusted suppliers and ensure quality before delivery"
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                description: "Quick and reliable delivery service to get your orders to you on time"
              },
              {
                icon: Shield,
                title: "Secure Shopping",
                description: "Your payments and personal information are protected with advanced security"
              },
              {
                icon: Heart,
                title: "24/7 Support",
                description: "Our customer support team is always ready to help you with any questions"
              },
              {
                icon: Award,
                title: "Best Prices",
                description: "Competitive pricing with regular discounts and special offers"
              },
              {
                icon: Sparkles,
                title: "Easy Returns",
                description: "Hassle-free return policy if you're not satisfied with your purchase"
              },
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${
                    index % 3 === 0 ? 'from-orange-500 to-red-500' : 
                    index % 3 === 1 ? 'from-red-500 to-pink-500' : 
                    'from-blue-500 to-cyan-500'
                  } mb-4`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-orange-500 via-red-500 to-blue-500 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">Ready to Start Shopping?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied customers and discover amazing products at great prices
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button 
                    size="lg" 
                    className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg"
                  >
                    Start Shopping
                  </Button>
                </Link>
                <Link to="/subscription-plans">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-6 text-lg"
                  >
                    View Plans
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;





