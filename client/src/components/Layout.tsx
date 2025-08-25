import React from 'react';
import { Link } from 'wouter'; 
import naraLogo from '@/assets/logo.png'; 

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* --- Header/Navbar Section --- */}
      <header className="bg-white shadow-sm p-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo link */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <img src={naraLogo} alt="NARA Logo" className="h-12 w-auto" />
            </a>
          </Link>
          
          {/* Navigation links */}
          <ul className="flex space-x-6 text-gray-700 font-medium">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/sea-level">Sea Level</Link></li>
            <li><Link href="/downloads">Downloads</Link></li>
            <li><Link href="/rti">RTI</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            {/* Add other navigation links as needed */}
          </ul>
        </nav>
      </header>

      {/* --- Main Content Area --- */}
      <main className="flex-grow">
        {children} {/* මෙතන children prop එක නිවැරදිව භාවිතා කරලා තියෙනවා */}
      </main>

      {/* --- Footer Section --- */}
      <footer className="bg-nara-navy text-white p-8">
        <div className="max-w-7xl mx-auto text-center">
          <p>© {new Date().getFullYear()} National Aquatic Resources Research and Development Agency (NARA). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}