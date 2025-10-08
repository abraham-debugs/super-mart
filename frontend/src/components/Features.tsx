import { ShieldCheck, Timer, Wallet } from "lucide-react";

export const Features = () => {
  const items = [
    { icon: ShieldCheck, title: "Good Quality", desc: "Fresh & trusted products" },
    { icon: Timer, title: "Fast Delivery", desc: "On-time to your door" },
    { icon: Wallet, title: "Minimum Cost", desc: "Best value everyday" },
  ];

  return (
    <section className="py-10 lg:py-12">
      <div className="container mx-auto px-4 grid gap-6 md:grid-cols-3">
        {items.map(({ icon: Icon, title, desc }, i) => (
          <div key={title} className="rounded-2xl border border-border bg-card shadow-soft p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-light text-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};


