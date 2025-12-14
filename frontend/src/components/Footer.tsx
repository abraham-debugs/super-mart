import React from "react";
import { Link } from "react-router-dom";
import { Mail, Twitter, Instagram, Facebook, Youtube, Linkedin, Star, Shield } from "lucide-react";

export function Footer(): JSX.Element {
	return (
		<footer className="w-full border-t bg-gradient-to-b from-orange-50 via-white to-orange-50 relative overflow-hidden border-orange-200">
			{/* Background Pattern */}
			<div className="absolute inset-0 bg-pattern opacity-5"></div>
			
			<div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
				{/* Top */}
				<div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
					{/* Brand + Newsletter */}
					<div className="col-span-1 lg:col-span-2">
						<div className="flex items-center gap-3 mb-6">
							<div className="relative">
								<div className="h-12 w-12 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-orange-100 text-xl shadow-lg">
									M
								</div>
								<div className="absolute inset-0 rounded-lg bg-orange-500 opacity-20 blur-lg"></div>
							</div>
							<span className="text-2xl font-bold text-gray-900">
								MDMart
							</span>
						</div>
						<p className="text-base text-muted-foreground leading-relaxed max-w-md mb-8">
							Your premium destination for fresh groceries and everyday essentials. 
							Experience lightning-fast delivery with our innovative seaweed-coated packaging.
						</p>
						
						{/* Newsletter */}
					

						{/* Social Links */}
						<div>
							<h3 className="text-lg font-semibold text-foreground mb-4">Follow Us</h3>
							<div className="flex items-center gap-3">
								<a className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 hover:bg-orange-600 transition-all duration-300" href="#">
									<Twitter className="w-5 h-5" />
								</a>
								<a className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 hover:bg-orange-600 transition-all duration-300" href="#">
									<Instagram className="w-5 h-5" />
								</a>
								<a className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 hover:bg-orange-600 transition-all duration-300" href="#">
									<Facebook className="w-5 h-5" />
								</a>
								<a className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 hover:bg-orange-600 transition-all duration-300" href="#">
									<Youtube className="w-5 h-5" />
								</a>
								<a className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 hover:bg-orange-600 transition-all duration-300" href="#">
									<Linkedin className="w-5 h-5" />
								</a>
							</div>
						</div>
					</div>

					{/* Shop */}
					<div>
						<h3 className="text-lg font-semibold text-foreground mb-6">Shop</h3>
						<ul className="space-y-3 text-muted-foreground">
							<li><a className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								All Products
							</a></li>
							<li><a className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								Fresh Produce
							</a></li>
							<li><a className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								Dairy & Eggs
							</a></li>
							<li><a className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								Snacks & Beverages
							</a></li>
							<li><a className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								Personal Care
							</a></li>
						</ul>
					</div>

					{/* Company */}
					<div>
						<h3 className="text-lg font-semibold text-foreground mb-6">Company</h3>
						<ul className="space-y-3 text-muted-foreground">
							<li>
								<Link className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" to="/about-us">
									<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
									About Us
								</Link>
							</li>
							<li><a className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								Careers
							</a></li>
							<li><a className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								Blog
							</a></li>
							<li><a className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								Contact
							</a></li>
						</ul>
					</div>
					
					{/* Support */}
					<div>
						<h3 className="text-lg font-semibold text-foreground mb-6">Support</h3>
						<ul className="space-y-3 text-muted-foreground">
							<li><a className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								Help Center
							</a></li>
							<li><a className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								Shipping Info
							</a></li>
							<li><a className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								Returns
							</a></li>
							<li><a className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								FAQs
							</a></li>
						</ul>
					</div>
				
				</div>

				{/* Bottom */}
				
			</div>
		</footer>
	);
}
