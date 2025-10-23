import React from "react";
import { Mail, Twitter, Instagram, Facebook, Youtube, Linkedin, Star, Truck, Shield, Award } from "lucide-react";

export function Footer(): JSX.Element {
	return (
		<footer className="w-full border-t bg-gradient-to-b from-primary/5 via-background to-secondary/5 relative overflow-hidden">
			{/* Background Pattern */}
			<div className="absolute inset-0 bg-pattern opacity-5"></div>
			
			<div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
				{/* Top */}
				<div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
					{/* Brand + Newsletter */}
					<div className="col-span-1 lg:col-span-2">
						<div className="flex items-center gap-3 mb-6">
							<div className="relative">
							<div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-lg">
								Z
							</div>
							<div className="absolute inset-0 rounded-2xl bg-blue-600 opacity-20 blur-lg"></div>
							</div>
							<span className="text-2xl font-bold text-blue-600">
								Zepto
							</span>
						</div>
						<p className="text-base text-muted-foreground leading-relaxed max-w-md mb-8">
							Your premium destination for fresh groceries and everyday essentials. 
							Experience lightning-fast delivery with our innovative seaweed-coated packaging.
						</p>
						
						{/* Newsletter */}
						<div className="mb-8">
							<h3 className="text-lg font-semibold text-foreground mb-4">Stay Updated</h3>
							<form className="space-y-4">
								<div className="flex gap-3">
									<div className="relative flex-1">
										<Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<input
											id="newsletter"
											type="email"
											placeholder="Enter your email"
											className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30"
										/>
									</div>
									<button
										type="button"
										className="h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
									>
										Subscribe
									</button>
								</div>
								<p className="text-sm text-muted-foreground">
									Get updates on new arrivals and exclusive deals. No spam, unsubscribe anytime.
								</p>
							</form>
						</div>

						{/* Social Links */}
						<div>
							<h3 className="text-lg font-semibold text-foreground mb-4">Follow Us</h3>
							<div className="flex items-center gap-3">
								<a className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300" href="#">
									<Twitter className="w-5 h-5" />
								</a>
								<a className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300" href="#">
									<Instagram className="w-5 h-5" />
								</a>
								<a className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300" href="#">
									<Facebook className="w-5 h-5" />
								</a>
								<a className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300" href="#">
									<Youtube className="w-5 h-5" />
								</a>
								<a className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-blue-800 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300" href="#">
									<Linkedin className="w-5 h-5" />
								</a>
							</div>
						</div>
					</div>

					{/* Shop */}
					<div>
						<h3 className="text-lg font-semibold text-foreground mb-6">Shop</h3>
						<ul className="space-y-3 text-muted-foreground">
							<li><a className="hover:text-primary transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-primary rounded-full"></span>
								All Products
							</a></li>
							<li><a className="hover:text-primary transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-primary rounded-full"></span>
								Fresh Produce
							</a></li>
							<li><a className="hover:text-primary transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-primary rounded-full"></span>
								Dairy & Eggs
							</a></li>
							<li><a className="hover:text-primary transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-primary rounded-full"></span>
								Snacks & Beverages
							</a></li>
							<li><a className="hover:text-primary transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-primary rounded-full"></span>
								Personal Care
							</a></li>
						</ul>
					</div>

					{/* Company */}
					<div>
						<h3 className="text-lg font-semibold text-foreground mb-6">Company</h3>
						<ul className="space-y-3 text-muted-foreground">
							<li><a className="hover:text-primary transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-primary rounded-full"></span>
								About Us
							</a></li>
							<li><a className="hover:text-primary transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-primary rounded-full"></span>
								Careers
							</a></li>
							<li><a className="hover:text-primary transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-primary rounded-full"></span>
								Blog
							</a></li>
							<li><a className="hover:text-primary transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-primary rounded-full"></span>
								Press
							</a></li>
						</ul>
					</div>

					{/* Support */}
					<div>
						<h3 className="text-lg font-semibold text-foreground mb-6">Support</h3>
						<ul className="space-y-3 text-muted-foreground">
							<li><a className="hover:text-primary transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-primary rounded-full"></span>
								Help Center
							</a></li>
							<li><a className="hover:text-primary transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-primary rounded-full"></span>
								Shipping & Delivery
							</a></li>
							<li><a className="hover:text-primary transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-primary rounded-full"></span>
								Returns & Refunds
							</a></li>
							<li><a className="hover:text-primary transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-primary rounded-full"></span>
								Contact Us
							</a></li>
						</ul>
					</div>
				</div>

				

				{/* Bottom */}
				<div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-border/50 pt-8 text-muted-foreground sm:flex-row">
					<div className="flex items-center gap-2">
						<Star className="w-4 h-4 text-yellow-500 fill-current" />
						<span>© {new Date().getFullYear()} Zepto. All rights reserved.</span>
					</div>
					<div className="flex items-center gap-6">
						<a className="hover:text-primary transition-colors duration-200" href="#">Privacy Policy</a>
						<a className="hover:text-primary transition-colors duration-200" href="#">Terms of Service</a>
						<a className="hover:text-primary transition-colors duration-200" href="#">Cookie Policy</a>
					</div>
				</div>
			</div>
		</footer>
	);
}


