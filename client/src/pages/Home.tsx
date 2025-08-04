import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Microscope, Users, Droplets, Award, FlaskConical, TrendingUp, GraduationCap, FileText, Download, Info } from "lucide-react";
import CalendarWidget from "@/components/CalendarWidget";
import StatsCard from "@/components/StatsCard";
import ServiceCard from "@/components/ServiceCard";

export default function Home() {
  const { data: divisions, isLoading: divisionsLoading } = useQuery({
    queryKey: ['/api/divisions'],
  });

  const stats = [
    { icon: Microscope, value: "45+", label: "Research Publications", color: "text-nara-navy" },
    { icon: Users, value: "200+", label: "Scientists & Researchers", color: "text-nara-navy" },
    { icon: Droplets, value: "25", label: "Monitoring Stations", color: "text-nara-navy" },
    { icon: Award, value: "35+", label: "Years of Excellence", color: "text-nara-navy" },
  ];

  const services = [
    {
      icon: FlaskConical,
      title: "Marine Research",
      description: "Advanced marine ecosystem research, biodiversity studies, and conservation programs for sustainable fisheries.",
      href: "/services#marine-research"
    },
    {
      icon: TrendingUp,
      title: "Environmental Monitoring",
      description: "Real-time monitoring of water quality, sea level changes, and environmental parameters across coastal regions.",
      href: "/sea-level"
    },
    {
      icon: GraduationCap,
      title: "Training & Education",
      description: "Capacity building programs, workshops, and educational initiatives for aquatic resource professionals.",
      href: "/services#training"
    },
    {
      icon: FileText,
      title: "Policy Advisory",
      description: "Expert consultation and policy recommendations for sustainable fisheries and aquatic resource management.",
      href: "/services#policy"
    },
    {
      icon: Download,
      title: "Document Repository",
      description: "Access to research publications, reports, guidelines, and technical documents for aquatic resources.",
      href: "/downloads"
    },
    {
      icon: Info,
      title: "Right to Information",
      description: "Public access to information services, RTI request processing, and transparency initiatives.",
      href: "/rti"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-nara-light to-blue-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-nara-navy leading-tight mb-6">
                Advancing Aquatic Resources Research
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The National Aquatic Resources Research and Development Agency (NARA) is Sri Lanka's premier institution for marine and freshwater research, sustainable fisheries development, and aquatic ecosystem conservation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/services">
                  <button className="btn-primary">
                    Explore Our Research
                  </button>
                </Link>
                <Link href="/services">
                  <button className="btn-secondary">
                    Access Services
                  </button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600"
                alt="Marine research facility with modern equipment and ocean view"
                className="rounded-2xl shadow-2xl w-full h-auto object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg max-w-xs">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Microscope className="text-green-600 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">150+ Active Projects</p>
                    <p className="text-xs text-gray-600">Ongoing Research</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-nara-navy mb-4">Our Core Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              NARA provides comprehensive research, monitoring, and advisory services to support sustainable aquatic resource management across Sri Lanka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-nara-navy mb-4">Research Activities Calendar</h2>
            <p className="text-xl text-gray-600">Track ongoing research activities, events, and monitoring schedules</p>
          </div>
          <CalendarWidget />
        </div>
      </section>

      {/* Admin Preview Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-nara-navy mb-6">Administrative Dashboard</h2>
              <p className="text-xl text-gray-600 mb-8">
                Secure admin portal for managing research data, user profiles, documents, and monitoring RTI requests with comprehensive analytics.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Users className="text-green-600 w-5 h-5" />
                  </div>
                  <span className="text-gray-700 font-medium">User Profile Management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FileText className="text-green-600 w-5 h-5" />
                  </div>
                  <span className="text-gray-700 font-medium">Document Upload & Organization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Info className="text-green-600 w-5 h-5" />
                  </div>
                  <span className="text-gray-700 font-medium">RTI Request Tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <TrendingUp className="text-green-600 w-5 h-5" />
                  </div>
                  <span className="text-gray-700 font-medium">Real-time Analytics Dashboard</span>
                </div>
              </div>

              <Link href="/admin/login">
                <button className="btn-primary">
                  Access Admin Portal
                </button>
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-2xl p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-nara-navy">Dashboard Overview</h3>
                  <span className="text-sm text-gray-500">Live Data</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-nara-navy">142</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-gray-600">Pending RTI</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Sea Level Monitoring</span>
                    </div>
                    <span className="text-xs text-gray-500">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Document Review</span>
                    </div>
                    <span className="text-xs text-gray-500">Pending</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">User Registration</span>
                    </div>
                    <span className="text-xs text-gray-500">Processing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-nara-navy mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600">Contact us for research collaborations, information requests, or general inquiries</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-nara-light rounded-xl p-8 text-center">
              <div className="bg-white p-4 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Droplets className="text-nara-navy w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-nara-navy mb-4">Visit Us</h3>
              <p className="text-gray-700 mb-4">NARA Headquarters<br />Crow Island, Colombo 15<br />Sri Lanka</p>
              <Link href="/contact">
                <span className="text-nara-blue font-medium hover:underline cursor-pointer">Get Directions</span>
              </Link>
            </div>

            <div className="bg-nara-light rounded-xl p-8 text-center">
              <div className="bg-white p-4 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Users className="text-nara-navy w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-nara-navy mb-4">Call Us</h3>
              <p className="text-gray-700 mb-4">+94 11 2521000<br />+94 11 2521001<br />Fax: +94 11 2521002</p>
              <a href="tel:+94112521000" className="text-nara-blue font-medium hover:underline">Call Now</a>
            </div>

            <div className="bg-nara-light rounded-xl p-8 text-center">
              <div className="bg-white p-4 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Info className="text-nara-navy w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-nara-navy mb-4">RTI Requests</h3>
              <p className="text-gray-700 mb-4">Submit Right to Information requests online for transparent access to public information</p>
              <Link href="/rti">
                <span className="text-nara-blue font-medium hover:underline cursor-pointer">Submit RTI Request</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
