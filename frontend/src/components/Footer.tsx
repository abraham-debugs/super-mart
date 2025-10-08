import React from "react";

export function Footer(): JSX.Element {
	return (
		<footer className="w-full border-t bg-gradient-to-b from-primary/5 via-background to-secondary/5">
			<div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				{/* Top */}
				<div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
					{/* Brand + Newsletter */}
					<div className="col-span-1 lg:col-span-2">
						<div className="flex items-center gap-2">
							<div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center font-semibold text-primary">
								SM
							</div>
							<span className="text-lg font-semibold tracking-tight">Super Mart</span>
						</div>
						<p className="mt-3 max-w-prose text-sm text-muted-foreground">
							Your one-stop shop for fresh groceries and everyday essentials delivered fast.
						</p>
						<form className="mt-6">
							<label htmlFor="newsletter" className="sr-only">
								Subscribe to our newsletter
							</label>
							<div className="flex max-w-md items-center gap-2">
								<input
									id="newsletter"
									type="email"
									placeholder="Enter your email"
									className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								/>
								<button
									type="button"
									className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-accent px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:from-primary/90 hover:to-accent/90 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
								>
									Subscribe
								</button>
							</div>
							<p className="mt-2 text-xs text-muted-foreground">
								Get updates on new arrivals and exclusive deals. No spam.
							</p>
						</form>
						<div className="mt-6 flex items-center gap-3 text-sm">
							<a className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background/60 px-4 text-muted-foreground shadow-sm transition-colors hover:bg-primary/10 hover:text-foreground" href="#">Twitter</a>
							<a className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background/60 px-4 text-muted-foreground shadow-sm transition-colors hover:bg-primary/10 hover:text-foreground" href="#">Instagram</a>
							<a className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background/60 px-4 text-muted-foreground shadow-sm transition-colors hover:bg-primary/10 hover:text-foreground" href="#">Facebook</a>
						</div>
					</div>

					{/* Shop */}
					<div>
						<h3 className="text-sm font-semibold">Shop</h3>
						<ul className="mt-4 space-y-2 text-sm text-muted-foreground">
							<li><a className="hover:text-foreground" href="#">All Products</a></li>
							<li><a className="hover:text-foreground" href="#">Fresh Produce</a></li>
							<li><a className="hover:text-foreground" href="#">Dairy & Eggs</a></li>
							<li><a className="hover:text-foreground" href="#">Snacks</a></li>
							<li><a className="hover:text-foreground" href="#">Beverages</a></li>
						</ul>
					</div>

					{/* Company */}
					<div>
						<h3 className="text-sm font-semibold">Company</h3>
						<ul className="mt-4 space-y-2 text-sm text-muted-foreground">
							<li><a className="hover:text-foreground" href="#">About Us</a></li>
							<li><a className="hover:text-foreground" href="#">Careers</a></li>
							<li><a className="hover:text-foreground" href="#">Blog</a></li>
							<li><a className="hover:text-foreground" href="#">Press</a></li>
						</ul>
					</div>

					{/* Support */}
					<div>
						<h3 className="text-sm font-semibold">Support</h3>
						<ul className="mt-4 space-y-2 text-sm text-muted-foreground">
							<li><a className="hover:text-foreground" href="#">Help Center</a></li>
							<li><a className="hover:text-foreground" href="#">Shipping & Delivery</a></li>
							<li><a className="hover:text-foreground" href="#">Returns & Refunds</a></li>
							<li><a className="hover:text-foreground" href="#">Contact Us</a></li>
						</ul>
					</div>
				</div>

				{/* Bottom */}
				<div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
					<p>© {new Date().getFullYear()} Super Mart. All rights reserved.</p>
					<div className="flex items-center gap-6">
						<a className="hover:text-foreground" href="#">Privacy</a>
						<a className="hover:text-foreground" href="#">Terms</a>
						<a className="hover:text-foreground" href="#">Cookies</a>
					</div>
				</div>
			</div>
		</footer>
	);
}


