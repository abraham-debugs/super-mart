import React from "react";

const steps = [
    {
        title: "Open the app",
        description: "Choose from over 7000 products across groceries, fresh fruits & veggies, meat, pet care, beauty items & more",
        image: "/app_icon.png" // Placeholder for now, I'll need to make sure these images are available in public folder or imported
    },
    {
        title: "Place an order",
        description: "Add your favourite items to the cart & avail the best offers",
        image: "/order_icon.png"
    },
    {
        title: "Get free delivery",
        description: "Experience lighting-fast speed & get all your items delivered in 10 minutes",
        image: "/delivery_icon.png"
    }
];

export const HowItWorks = () => {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-12">How it Works</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-3xl p-8 flex flex-col items-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-50 transition-transform duration-300 hover:-translate-y-2 h-full"
                        >
                            <div className="w-32 h-32 md:w-40 md:h-40 mb-6 flex items-center justify-center">
                                <img
                                    src={step.image}
                                    alt={step.title}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
