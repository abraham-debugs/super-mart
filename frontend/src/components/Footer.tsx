import React from "react";
import { Link } from "react-router-dom";
import { Mail, Twitter, Instagram, Facebook, Youtube, Linkedin, Star, Shield } from "lucide-react";

export function Footer(): JSX.Element {
	return (
		<footer className="w-full border-t bg-gradient-to-b from-white-50 via-white to-gray-50 relative overflow-hidden border-green-200">
			{/* Background Pattern */}
			<div className="absolute inset-0 bg-pattern opacity-5"></div>

			<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
				{/* Top */}
				<div className="grid grid-cols-1 gap-8 sm:gap-10 lg:gap-12 sm:grid-cols-2 lg:grid-cols-5">
					{/* Brand + Newsletter */}
					<div className="col-span-1 lg:col-span-2">
						<div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
							<div className="relative">
								<div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-green-700 flex items-center justify-center font-bold text-green-100 text-lg sm:text-xl shadow-lg">
									MD
								</div>
								<div className="absolute inset-0 rounded-lg bg-green-500 opacity-20 blur-lg"></div>
							</div>
							<span className="text-xl sm:text-2xl font-bold text-gray-900">
								MDMart
							</span>
						</div>
						<p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mb-6 sm:mb-8">
							Your premium destination for fresh groceries and everyday essentials.
							Experience lightning-fast delivery with our innovative seaweed-coated packaging.
						</p>

						{/* Newsletter */}


						{/* Social Links */}
						<div>
							<h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Follow Us</h3>
							<div className="flex items-center gap-2 sm:gap-3">
								<a className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 hover:bg-orange-600 transition-all duration-300" href="#">
									<Twitter className="w-5 h-5" />
								</a>
								<a className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 hover:bg-orange-600 transition-all duration-300" href="#">
									<Instagram className="w-5 h-5" />
								</a>
								<a className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 hover:bg-orange-600 transition-all duration-300" href="#">
									<Facebook className="w-5 h-5" />
								</a>
								<a className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 hover:bg-orange-600 transition-all duration-300" href="#">
									<Youtube className="w-5 h-5" />
								</a>
								<a className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 hover:bg-orange-600 transition-all duration-300" href="#">
									<Linkedin className="w-5 h-5" />
								</a>
							</div>
						</div>
					</div>

					{/* Shop */}
					<div>
						<h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6">Shop</h3>
						<ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
							<Link to='/shop'><li><a className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								All Products
							</a></li></Link>
							<li><Link className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" to="/shop?category=Fresh%20Produce">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								Fresh Produce
							</Link></li>
							<li><Link className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" to="/shop?category=Dairy%20%26%20Eggs">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								Dairy & Eggs
							</Link></li>
							<li><Link className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" to="/shop?category=Snacks%20%26%20Beverages">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								Snacks & Beverages
							</Link></li>
							<li><Link className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" to="/shop?category=Personal%20Care">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								Personal Care
							</Link></li>
						</ul>
					</div>

					{/* Company */}
					<div>
						<h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6">Company</h3>
						<ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
							<li>
								<Link className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" to="/about-us">
									<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
									About Us
								</Link>
							</li>

							<li><a className="hover:text-orange-600 transition-colors duration-200 flex items-center gap-2" href="#">
								<span className="w-1 h-1 bg-orange-500 rounded-full"></span>
								Contact
							</a></li>
						</ul>
					</div>

					{/* Support */}



				</div>

				{/* Bottom */}

			</div>
		</footer>
	);
}
