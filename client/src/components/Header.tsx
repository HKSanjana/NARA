import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/divisions", label: "Divisions" },
    { href: "/downloads", label: "Downloads" },
    { href: "/library", label: "Library" },
    { href: "/mail", label: "Mail" },
    { href: "/rti", label: "Right to Information" },
    { href: "/sea-level", label: "Sea Level" },
  ];

  return (
    <header className="fixed top-0 w-full bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&h=60" 
                alt="NARA Logo" 
                className="h-12 w-auto object-contain" 
              />
              <div className="ml-3 hidden sm:block">
                <h1 className="text-lg font-semibold text-nara-navy">NARA</h1>
                <p className="text-xs text-gray-600">National Aquatic Resources</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className={`font-medium transition-colors duration-200 ${
                  location === item.href 
                    ? "text-nara-navy" 
                    : "text-gray-700 hover:text-nara-blue"
                }`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Language & Admin Access */}
          <div className="hidden lg:flex items-center space-x-4">
            <button className="text-sm text-gray-600 hover:text-nara-blue transition-colors">සිං</button>
            <span className="text-gray-400">|</span>
            <button className="text-sm text-gray-600 hover:text-nara-blue transition-colors">தமிழ்</button>
            <Link href="/admin/login">
              <span className="bg-nara-navy text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition-colors">
                Admin Login
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden relative w-6 h-6 focus:outline-none focus:ring-2 focus:ring-nara-blue rounded"
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-nara-navy" />
            ) : (
              <Menu className="w-6 h-6 text-nara-navy" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white shadow-xl z-50 slide-in-right">
            <div className="flex flex-col h-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-nara-navy">Navigation</h2>
              </div>
              <nav className="flex-1 px-6 py-6 space-y-6 custom-scrollbar overflow-y-auto">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <span 
                      className={`block text-lg font-medium transition-colors cursor-pointer ${
                        location === item.href 
                          ? "text-nara-navy font-semibold" 
                          : "text-gray-700 hover:text-nara-blue"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </nav>
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex space-x-4 mb-4">
                  <button className="text-sm text-gray-600 hover:text-nara-blue transition-colors">සිංහල</button>
                  <button className="text-sm text-gray-600 hover:text-nara-blue transition-colors">தமிழ்</button>
                </div>
                <Link href="/admin/login">
                  <span 
                    className="block w-full bg-nara-navy text-white px-4 py-2 rounded-md text-center font-medium hover:bg-blue-800 transition-colors cursor-pointer"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Login
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
