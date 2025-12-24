import { Ticket, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 border-t border-slate-800 mt-20">
      <div className="container mx-auto px-4 md:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground font-bold text-xl rounded p-1">
                <Ticket className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-xl">TicketHub</span>
            </Link>
            <p className="text-sm text-slate-400">Your ultimate destination for booking movie tickets and event passes.</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary transition">Home</Link></li>
              <li><Link href="/#movies-section" className="hover:text-primary transition">Browse Movies</Link></li>
              <li><Link href="/my-bookings" className="hover:text-primary transition">My Bookings</Link></li>
              <li><Link href="/auth" className="hover:text-primary transition">Sign In</Link></li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">About</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-primary transition">Careers</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-slate-400">+1 (800) TicketHub</p>
                  <p className="text-slate-500 text-xs">Mon-Fri, 9AM-6PM EST</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                <p className="text-slate-400">support@TicketHub.com</p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                <p className="text-slate-400">123 Cinema Lane, Theater City, TC 12345</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800" />

        {/* Bottom Section */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between text-sm text-slate-400">
          <p>&copy; 2024 TicketHub. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition">Facebook</a>
            <a href="#" className="hover:text-primary transition">Twitter</a>
            <a href="#" className="hover:text-primary transition">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
