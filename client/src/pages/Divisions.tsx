import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Divisions() {
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);

  const { data: divisions = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/divisions'],
  });

  // Mock division data for display
  const mockDivisions = [
    {
      id: "marine-biology",
      name: "Marine Biology Research Division",
      description: "Advanced marine ecosystem research and biodiversity studies",
      head: "Dr. Priya Wijeyaratne",
      email: "marine@nara.ac.lk",
      phone: "+94 11 2521010",
      services: ["Marine biodiversity surveys", "Fish stock assessments", "Coral reef monitoring"],
      products: ["Research reports", "Species identification guides", "Monitoring data"],
      staff: [
        { name: "Dr. Priya Wijeyaratne", position: "Division Head", image: "https://images.unsplash.com/photo-1494790108755-2616b612b043?w=150&h=150&fit=crop&crop=face" },
        { name: "Dr. Sampath Kumar", position: "Senior Researcher", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
        { name: "Ms. Nisha Perera", position: "Research Officer", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face" }
      ]
    },
    {
      id: "fishing-tech",
      name: "Fishing Technology Division",
      description: "Sustainable fishing technology development and gear innovation",
      head: "Dr. Roshan Fernando",
      email: "fishtech@nara.ac.lk", 
      phone: "+94 11 2521020",
      services: ["Gear technology development", "Vessel design", "Post-harvest technology"],
      products: ["Fishing gear designs", "Technology manuals", "Equipment specifications"],
      staff: [
        { name: "Dr. Roshan Fernando", position: "Division Head", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" },
        { name: "Eng. Chaminda Silva", position: "Technology Specialist", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face" }
      ]
    },
    {
      id: "monitoring",
      name: "Monitoring and Evaluation Division", 
      description: "Environmental monitoring and data analysis for aquatic ecosystems",
      head: "Dr. Menaka Gamage",
      email: "monitoring@nara.ac.lk",
      phone: "+94 11 2521030",
      services: ["Water quality monitoring", "Environmental assessments", "Data analysis"],
      products: ["Monitoring reports", "Environmental data", "Assessment studies"],
      staff: [
        { name: "Dr. Menaka Gamage", position: "Division Head", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" }
      ]
    },
    {
      id: "aquaculture",
      name: "Aquaculture and Inland Fisheries",
      description: "Aquaculture development and inland fisheries management",
      head: "Dr. Asanka Rathnayake",
      email: "aquaculture@nara.ac.lk", 
      phone: "+94 11 2521040",
      services: ["Aquaculture system design", "Species development", "Inland fisheries management"],
      products: ["Culture protocols", "Species guides", "Management plans"],
      staff: [
        { name: "Dr. Asanka Rathnayake", position: "Division Head", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" }
      ]
    },
    {
      id: "hydrographic",
      name: "National Hydrographic Office",
      description: "Hydrographic surveys and nautical charting services",
      head: "Capt. Nuwan Perera",
      email: "hydro@nara.ac.lk",
      phone: "+94 11 2521050", 
      services: ["Hydrographic surveys", "Nautical charting", "Marine navigation support"],
      products: ["Nautical charts", "Survey reports", "Navigation aids"],
      staff: [
        { name: "Capt. Nuwan Perera", position: "Division Head", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face" }
      ]
    },
    {
      id: "tech-transfer",
      name: "Technology Transfer Division",
      description: "Technology dissemination and knowledge transfer to stakeholders",
      head: "Dr. Kumari Dissanayake",
      email: "techtramsfer@nara.ac.lk",
      phone: "+94 11 2521060",
      services: ["Technology transfer", "Training programs", "Extension services"],
      products: ["Training materials", "Extension guides", "Technology packages"],
      staff: [
        { name: "Dr. Kumari Dissanayake", position: "Division Head", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face" }
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  const displayDivisions = divisions.length > 0 ? divisions : mockDivisions;
  const currentDivision = selectedDivision 
    ? displayDivisions.find(d => d.id === selectedDivision)
    : displayDivisions[0];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-nara-light to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-nara-navy mb-6">Our Divisions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Specialized research divisions working together to advance aquatic resources science and technology.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Division Selector */}
          <div className="flex flex-wrap gap-4 mb-12">
            {displayDivisions.map((division) => (
              <button
                key={division.id}
                onClick={() => setSelectedDivision(division.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  (!selectedDivision && division === displayDivisions[0]) ||
                  selectedDivision === division.id
                    ? "bg-nara-navy text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {division.name}
              </button>
            ))}
          </div>

          {/* Division Details */}
          {currentDivision && (
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-nara-navy mb-4">{currentDivision.name}</h2>
              <p className="text-lg text-gray-600 mb-8">{currentDivision.description}</p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* About */}
                <div className="bg-nara-light rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-nara-navy mb-4">Contact Information</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Head:</strong> {currentDivision.head}</p>
                    <p><strong>Email:</strong> {currentDivision.email}</p>
                    <p><strong>Phone:</strong> {currentDivision.phone}</p>
                  </div>
                </div>

                {/* Services */}
                <div className="bg-nara-light rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-nara-navy mb-4">Services</h3>
                  <ul className="space-y-2">
                    {currentDivision.services?.map((service, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-nara-blue rounded-full mt-2 mr-3"></div>
                        <span className="text-gray-700">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Products */}
                <div className="bg-nara-light rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-nara-navy mb-4">Products</h3>
                  <ul className="space-y-2">
                    {currentDivision.products?.map((product, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-nara-blue rounded-full mt-2 mr-3"></div>
                        <span className="text-gray-700">{product}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Staff */}
              {currentDivision.staff && currentDivision.staff.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold text-nara-navy mb-6">Key Staff</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {currentDivision.staff.map((member, index) => (
                      <div key={index} className="bg-nara-light rounded-lg p-4 text-center card-hover">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                        />
                        <h4 className="font-semibold text-nara-navy mb-1">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.position}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
