import { useQuery } from "@tanstack/react-query";
import { FlaskConical, TrendingUp, GraduationCap, FileText, Microscope, Droplets } from "lucide-react";

export default function Services() {
  const services = [
    {
      icon: FlaskConical,
      title: "Marine Biology Research",
      description: "Comprehensive marine ecosystem studies, biodiversity assessment, and species conservation programs.",
      features: [
        "Marine biodiversity surveys",
        "Fish stock assessments", 
        "Coral reef monitoring",
        "Marine protected area management"
      ]
    },
    {
      icon: Microscope,
      title: "Fishing Technology",
      description: "Development and evaluation of sustainable fishing technologies and gear innovations.",
      features: [
        "Gear technology development",
        "Vessel design optimization",
        "Post-harvest technology",
        "Fishing efficiency studies"
      ]
    },
    {
      icon: TrendingUp,
      title: "Environmental Monitoring",
      description: "Real-time monitoring of aquatic environmental parameters and ecosystem health.",
      features: [
        "Water quality assessment",
        "Pollution monitoring",
        "Climate change impact studies",
        "Ecosystem health indicators"
      ]
    },
    {
      icon: Droplets,
      title: "Aquaculture Development",
      description: "Research and development of sustainable aquaculture systems and practices.",
      features: [
        "Aquaculture system design",
        "Species domestication",
        "Feed development",
        "Disease management"
      ]
    },
    {
      icon: GraduationCap,
      title: "Training & Capacity Building",
      description: "Educational programs and capacity building initiatives for aquatic resource professionals.",
      features: [
        "Technical training programs",
        "Research methodology courses",
        "Technology transfer workshops",
        "Community outreach programs"
      ]
    },
    {
      icon: FileText,
      title: "Policy & Advisory Services",
      description: "Expert consultation and policy recommendations for sustainable resource management.",
      features: [
        "Policy development support",
        "Management plan preparation",
        "Impact assessments",
        "Scientific advisory services"
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-nara-light to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-nara-navy mb-6">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            NARA provides comprehensive research, monitoring, and advisory services to support 
            sustainable aquatic resource management across Sri Lanka.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-8 card-hover">
                <div className="bg-nara-light p-4 rounded-lg w-16 h-16 flex items-center justify-center mb-6">
                  <service.icon className="text-nara-navy w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-nara-navy mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-nara-blue rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-nara-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-nara-navy mb-4">Need Our Services?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Contact us to discuss how NARA can support your aquatic resource management needs.
          </p>
          <button className="btn-primary">
            Get in Touch
          </button>
        </div>
      </section>
    </div>
  );
}
