import React, { useState } from "react";
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Send,
    MessageSquare,
    User,
    AtSign,
    Globe,
    Instagram,
    Facebook,
    Twitter,
    Linkedin
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const Contact: React.FC = () => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            toast({
                title: "Message Sent!",
                description: "Thank you for reaching out. We'll get back to you shortly.",
            });
            (e.target as HTMLFormElement).reset();
        }, 1500);
    };

    const contactInfos = [
        {
            icon: Phone,
            title: "Call Us",
            details: ["+1 (234) 567-890", "+1 (234) 987-654"],
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            icon: Mail,
            title: "Email Us",
            details: ["hello@mdmart.com", "support@mdmart.com"],
            color: "text-rose-500",
            bg: "bg-rose-50"
        },
        {
            icon: MapPin,
            title: "Visit Us",
            details: ["123 Innovation Way,", "Silicon Valley, CA 94025"],
            color: "text-amber-500",
            bg: "bg-amber-50"
        },
        {
            icon: Clock,
            title: "Working Hours",
            details: ["Mon - Fri: 9AM - 8PM", "Sat - Sun: 10AM - 6PM"],
            color: "text-emerald-500",
            bg: "bg-emerald-50"
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Premium Hero Section */}
            <section className="relative pt-32 pb-24 overflow-hidden bg-gray-50">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] rounded-full translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-full bg-blue-500/5 blur-[100px] rounded-full -translate-x-1/2"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-[0.2em] text-primary uppercase bg-primary/10 rounded-full">
                        Contact Us
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight">
                        Let's Start a <span className="text-primary italic">Conversation.</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-light">
                        Have a question, feedback, or just want to say hi? We're here to listen and help you in every way possible.
                    </p>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-20 -mt-16 container mx-auto px-4 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {contactInfos.map((info, index) => (
                        <Card key={index} className="border-0 shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white/80 backdrop-blur-xl rounded-[40px] hover:-translate-y-2 transition-all duration-300">
                            <CardContent className="p-10 flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-2xl ${info.bg} ${info.color} flex items-center justify-center mb-8`}>
                                    <info.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{info.title}</h3>
                                {info.details.map((detail, idx) => (
                                    <p key={idx} className="text-gray-500 font-light">{detail}</p>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Form & Socials Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-20 max-w-7xl mx-auto">
                        {/* Left Side: Text and Socials */}
                        <div className="lg:w-2/5 space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-4xl font-bold text-gray-900 leading-tight">We value your <br /> <span className="text-primary italic">Experience</span> above all.</h2>
                                <p className="text-lg text-gray-600 font-light leading-relaxed">
                                    Our dedicated support team is available around the clock to ensure your MD Mart journey is seamless. Reach out and expect a response within 24 hours.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-lg font-bold text-gray-900 uppercase tracking-widest">Connect with us</h4>
                                <div className="flex gap-4">
                                    {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
                                        <button key={i} className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                                            <Icon className="h-5 w-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-10 bg-primary/5 rounded-[40px] border border-primary/10">
                                <div className="flex items-start gap-4">
                                    <Globe className="h-6 w-6 text-primary mt-1" />
                                    <div>
                                        <h5 className="font-bold text-gray-900 text-lg">Global Headquarters</h5>
                                        <p className="text-gray-500 font-light mt-2">
                                            456 Tech Boulevard, Innovation Square <br />
                                            New York, NY 10001
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Contact Form */}
                        <div className="lg:w-3/5">
                            <div className="bg-white border border-gray-100 p-12 rounded-[50px] shadow-[0_30px_60px_rgba(0,0,0,0.03)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px]"></div>

                                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                <User className="h-4 w-4 text-primary" /> Full Name
                                            </label>
                                            <Input
                                                required
                                                placeholder="Johnny Depp"
                                                className="h-14 rounded-2xl border-gray-100 focus:border-primary/20 bg-gray-50/50"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                <AtSign className="h-4 w-4 text-primary" /> Email Address
                                            </label>
                                            <Input
                                                required
                                                type="email"
                                                placeholder="johnny@example.com"
                                                className="h-14 rounded-2xl border-gray-100 focus:border-primary/20 bg-gray-50/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-primary" /> Subject
                                        </label>
                                        <Input
                                            required
                                            placeholder="How can we help you?"
                                            className="h-14 rounded-2xl border-gray-100 focus:border-primary/20 bg-gray-50/50"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-primary" /> Your Message
                                        </label>
                                        <Textarea
                                            required
                                            placeholder="Share your thoughts with us..."
                                            className="min-h-[180px] rounded-[30px] border-gray-100 focus:border-primary/20 bg-gray-50/50 p-6"
                                        />
                                    </div>

                                    <Button
                                        disabled={isSubmitting}
                                        className="w-full h-16 rounded-full font-bold text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center gap-3"
                                    >
                                        {isSubmitting ? "Sending..." : (
                                            <>
                                                Send Message <Send className="h-5 w-5" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section Mockup */}
            <section className="py-24 container mx-auto px-4">
                <div className="h-[500px] w-full bg-gray-100 rounded-[60px] overflow-hidden relative group">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                    <div className="absolute bottom-12 left-12">
                        <h4 className="text-3xl font-bold text-white mb-2 underline decoration-primary">Find Us Here</h4>
                        <p className="text-white/80 font-light">Global Innovation Hub & Logistics Center</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
