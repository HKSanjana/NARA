import { Link } from "wouter";
import { Facebook, Twitter, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  const footerSections = [
    {
      title: "About NARA",
      links: [
        { href: "/about", label: "Overview" },
        { href: "/about#nara-act", label: "NARA Act" },
        { href: "/about#history", label: "History" },
        { href: "/about#leadership", label: "Leadership" },
      ]
    },
    {
      title: "Research",
      links: [
        { href: "/services#marine-research", label: "Marine Research" },
        { href: "/services#freshwater", label: "Freshwater Studies" },
        { href: "/services#aquaculture", label: "Aquaculture" },
        { href: "/library#publications", label: "Publications" },
      ]
    },
    {
      title: "Services",
      links: [
        { href: "/services#monitoring", label: "Environmental Monitoring" },
        { href: "/services#training", label: "Training Programs" },
        { href: "/services#consulting", label: "Consulting Services" },
        { href: "/rti", label: "RTI Requests" },
      ]
    },
    {
      title: "Quick Links",
      links: [
        { href: "/downloads", label: "Downloads" },
        { href: "/library", label: "Digital Library" },
        { href: "/sea-level", label: "Sea Level Data" },
        { href: "/contact", label: "Contact Us" },
      ]
    }
  ];

  const partnerLogos = [
    {
      href: "https://www.president.gov.lk/",
      src: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=60",
      alt: "President's Office of Sri Lanka"
    },
    {
      href: "https://www.fisheries.gov.lk/",
      src: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=60",
      alt: "Ministry of Fisheries"
    },
    {
      href: "https://www.pmoffice.gov.lk/",
      src: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=60",
      alt: "Prime Minister's Office"
    },
    {
      href: "https://meteo.gov.lk/",
      src: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=60",
      alt: "Department of Meteorology"
    }
  ];

  return (
    <footer className="government-footer text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Government Partner Links */}
        <div className="text-center mb-12">
          <h3 className="text-xl font-semibold mb-8">Government Partners</h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {partnerLogos.map((partner, index) => (
              <a
                key={index}
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-75 hover:opacity-100 transition-opacity"
              >
                <img
                  src={partner.src}
                  alt={partner.alt}
                  className="h-12 object-contain filter brightness-0 invert"
                />
              </a>
            ))}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2 text-gray-300">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href}>
                      <span className="hover:text-white transition-colors cursor-pointer">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-blue-800 pt-8 text-center">
          <div className="flex justify-center space-x-6 mb-6">
            <a
              href="https://www.facebook.com/narasrilanka"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com/narasrilanka"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/company/nara-sri-lanka"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://www.youtube.com/@narasrilanka"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>
          <p className="text-gray-400 text-sm">
            &copy; 2024 National Aquatic Resources Research and Development Agency (NARA). All Rights Reserved.
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Government of Sri Lanka | Website maintained by NARA IT Division
          </p>
        </div>
      </div>
    </footer>
  );
}
