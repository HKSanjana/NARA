import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function About() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "nara-act", label: "NARA Act" },
    { id: "contact", label: "Contact" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-nara-navy mb-4">About NARA</h2>
            <p className="text-gray-600 mb-6">
              The National Aquatic Resources Research and Development Agency (NARA) is Sri Lanka's premier 
              institution dedicated to aquatic resources research and development. Established under the 
              Ministry of Fisheries and Aquatic Resources Development, NARA plays a crucial role in 
              sustainable fisheries management and marine conservation.
            </p>
            <h3 className="text-xl font-semibold text-nara-navy mb-3">Our Mission</h3>
            <p className="text-gray-600 mb-6">
              To advance scientific knowledge and technology for the sustainable development and management 
              of Sri Lanka's aquatic resources through innovative research, monitoring, and capacity building.
            </p>
            <h3 className="text-xl font-semibold text-nara-navy mb-3">Our Vision</h3>
            <p className="text-gray-600">
              To be the leading institution in South Asia for aquatic resources research and development, 
              contributing to food security, environmental sustainability, and economic development.
            </p>
          </div>
        );
      case "nara-act":
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-nara-navy mb-4">NARA Act</h2>
            <p className="text-gray-600 mb-6">
              The National Aquatic Resources Research and Development Agency Act provides the legal 
              framework for NARA's operations and mandates.
            </p>
            <h3 className="text-xl font-semibold text-nara-navy mb-3">Key Provisions</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Establishment of NARA as the national authority for aquatic resources research</li>
              <li>Research and development mandate for marine and freshwater resources</li>
              <li>Environmental monitoring and assessment responsibilities</li>
              <li>Technology transfer and capacity building authority</li>
              <li>Collaboration with national and international institutions</li>
            </ul>
          </div>
        );
      case "contact":
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-nara-navy mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-nara-navy mb-3">Headquarters</h3>
                <p className="text-gray-600">
                  National Aquatic Resources Research and Development Agency<br />
                  Crow Island, Colombo 15<br />
                  Sri Lanka
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-nara-navy mb-3">Contact Details</h3>
                <p className="text-gray-600">
                  Phone: +94 11 2521000<br />
                  Fax: +94 11 2521002<br />
                  Email: info@nara.ac.lk
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-nara-light to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-nara-navy mb-6">About NARA</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our mission, legal foundation, and how we drive innovation and research 
            in aquatic resource development across Sri Lanka.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-4 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-nara-navy text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderTabContent()}
        </div>
      </section>
    </div>
  );
}
